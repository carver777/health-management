package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.utils.JwtUtils;
import com.stringtinyst.healthlife.utils.UserChatSessionManager;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ChatController.class)
class ChatControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private DashScopeChatModel dashScopeChatModel;
  @MockitoBean private UserChatSessionManager sessionManager;
  @MockitoBean private JwtUtils jwtUtils;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper();
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    when(jwtUtils.parseJWT("token-blank")).thenReturn(claims("u-blank"));
  }

  private Claims claims(String userId) {
    DefaultClaims claims = new DefaultClaims();
    claims.put("userID", userId);
    return claims;
  }

  @Test
  @DisplayName("聊天流接口 query 为空返回提示并关闭事件")
  void chatStreamEmptyMessage() throws Exception {
    String body = objectMapper.writeValueAsString(Map.of("query", "   "));

    mockMvc
        .perform(
            post("/chat/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer token-blank")
                .content(body))
        .andExpect(status().isOk())
        .andExpect(content().string(org.hamcrest.Matchers.containsString("content")))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("event: close")));
  }
}
