package com.stringtinyst.healthlife.controller;

import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.utils.JwtUtils;
import com.stringtinyst.healthlife.utils.UserChatSessionManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private DashScopeChatModel dashScopeChatModel;
    @Autowired
    private UserChatSessionManager sessionManager;
    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping(produces = "text/html;charset=UTF-8")
    public Flux<String> chat(
            @RequestParam("msg") String message,
            @RequestHeader("token") String token) {

        String userId = extractUserIdFromToken(token);
        ChatMemory chatMemory = sessionManager.getChatMemory(userId);

        ChatClient chatClient = ChatClient.builder(dashScopeChatModel)
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
                .build();

        return chatClient.prompt()
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

    @PostMapping(value = "/stream", produces = "text/event-stream;charset=UTF-8")
    public Flux<String> chatStream(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authorization) {

        String token = authorization.replace("Bearer ", "");
        String userId = extractUserIdFromToken(token);
        String message = (String) request.get("query");

        if (message == null || message.trim().isEmpty()) {
            return Flux.just("data: " + "{\"content\":\"消息不能为空\"}\n\n",
                           "event: close\n\n");
        }

        ChatMemory chatMemory = sessionManager.getChatMemory(userId);
        ChatClient chatClient = ChatClient.builder(dashScopeChatModel)
                .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
                .build();

        return chatClient.prompt()
                .user(message)
                .advisors(spec -> spec.param("conversation_id", userId).param("retrieve_size", 10))
                .stream()
                .content()
                .map(content -> "data: " + "{\"content\":\"" + escapeJson(content) + "\"}\n\n")
                .concatWith(Flux.just("event: close\n\n"))
                .doOnError(error -> log.error("流式聊天错误 - 用户ID: {}, 错误: {}", userId, error.getMessage()));
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
