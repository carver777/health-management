package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.config.AiPromptTemplate;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.utils.JwtUtils;
import com.stringtinyst.healthlife.utils.UserChatSessionManager;
import java.time.Duration;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
@RequestMapping("/chat")
public class ChatController {

  private static final String[] FUNCTION_TOOLBOX = {
    "queryBodyMetrics",
    "addBodyMetric",
    "querySleepRecords",
    "addSleepRecord",
    "updateSleepRecord",
    "queryDietRecords",
    "addDietRecord",
    "updateDietRecord",
    "queryExerciseRecords",
    "addExerciseRecord",
    "updateExerciseRecord",
    "webSearch"
  };

  @Autowired private ChatModel chatModel;
  @Autowired private UserChatSessionManager sessionManager;
  @Autowired private JwtUtils jwtUtils;

  @GetMapping(produces = "text/html;charset=UTF-8")
  public Flux<String> chat(
      @RequestParam("msg") String message, @RequestHeader("token") String token) {

    String userId = extractUserIdFromToken(token);
    ChatMemory chatMemory = sessionManager.getChatMemory(userId);
    String systemPrompt = AiPromptTemplate.buildSystemPrompt();

    ChatClient chatClient =
        ChatClient.builder(chatModel)
            .defaultSystem(systemPrompt)
            .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
            .build();

    return chatClient
        .prompt()
        .user(message)
        .advisors(spec -> spec.param("conversation_id", userId).param("retrieve_size", 10))
        .stream()
        .content();
  }

  @DeleteMapping("/memory")
  public Result clearChatMemory(@RequestHeader("Authorization") String authorization) {
    String token = authorization.replace("Bearer ", "");
    String userId = extractUserIdFromToken(token);
    sessionManager.clearChatMemory(userId);
    return Result.success("已开始新对话");
  }

  @PostMapping(value = "/stream")
  public ResponseEntity<Flux<String>> chatStream(
      @RequestBody Map<String, Object> request,
      @RequestHeader("Authorization") String authorization) {

    String token = authorization.replace("Bearer ", "");
    String userId = extractUserIdFromToken(token);
    String message = (String) request.get("query");

    if (message == null || message.trim().isEmpty()) {
      return ResponseEntity.ok()
          .contentType(MediaType.TEXT_EVENT_STREAM)
          .header("Cache-Control", "no-cache, no-store, must-revalidate")
          .header("X-Accel-Buffering", "no") // 禁用 Nginx 代理缓冲
          .header("Connection", "keep-alive")
          .body(Flux.just("data: {\"content\":\"消息不能为空\"}\n\n", "event: close\n\n"));
    }

    ChatMemory chatMemory = sessionManager.getChatMemory(userId);

    // 在用户消息中注入用户 ID，供 Function 使用
    String enhancedMessage = String.format("[用户ID: %s] %s", userId, message);
    String systemPrompt = AiPromptTemplate.buildSystemPrompt();

    ChatClient chatClient =
        ChatClient.builder(chatModel)
            .defaultSystem(systemPrompt)
            .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
            .defaultFunctions(FUNCTION_TOOLBOX)
            .build();

    Flux<String> responseStream =
        chatClient
            .prompt()
            .user(enhancedMessage)
            .advisors(spec -> spec.param("conversation_id", userId).param("retrieve_size", 10))
            .stream()
            .content()
            .timeout(Duration.ofSeconds(60))
            .filter(content -> content != null && !content.isEmpty())
            .map(content -> "{\"content\":\"" + escapeJson(content) + "\"}")
            .onErrorResume(
                error -> {
                  log.error("流式聊天错误 - 用户ID: {}, 错误: {}", userId, error.getMessage(), error);
                  String errorRaw = error.getMessage() == null ? "" : error.getMessage();
                  String errorMessage;
                  if (errorRaw.contains("503")) {
                    errorMessage = "AI 服务暂时不可用，请稍后重试";
                  } else if (errorRaw.contains("429")) {
                    errorMessage = "请求过于频繁，请稍后重试";
                  } else if (errorRaw.contains("Did not observe any item")) {
                    errorMessage = "AI 服务响应超时，请稍后重试";
                  } else {
                    errorMessage = "抱歉，处理您的请求时出现错误，请稍后重试";
                  }
                  return Flux.just("{\"content\":\"" + escapeJson(errorMessage) + "\"}");
                });

    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_EVENT_STREAM)
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .header("X-Accel-Buffering", "no") // 禁用 Nginx 代理缓冲
        .header("Connection", "keep-alive")
        .body(responseStream);
  }

  private String escapeJson(String str) {
    if (str == null) return "";
    return str.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t");
  }

  private String extractUserIdFromToken(String token) {
    try {
      Map<String, Object> claims = jwtUtils.parseJWT(token);
      Object userId = claims.get("userID");
      if (userId == null || userId.toString().isEmpty()) {
        throw new IllegalArgumentException("Token 中未包含 userID");
      }
      return userId.toString();
    } catch (Exception e) {
      throw new IllegalArgumentException("无效的 token 或 token 中无 userId");
    }
  }
}
