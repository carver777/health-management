package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UploadController.class)
class UploadControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private JwtUtils jwtUtils;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  @BeforeEach
  void setUp() throws Exception {
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  private Claims claims(String userId) {
    DefaultClaims claims = new DefaultClaims();
    claims.put("userID", userId);
    return claims;
  }

  @Test
  @DisplayName("未携带 token 获取头像返回 401")
  void getAvatarWithoutToken() throws Exception {
    mockMvc.perform(get("/user/avatar")).andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("携带 token 但文件不存在返回 404")
  void getAvatarNotFound() throws Exception {
    when(jwtUtils.parseJWT("token-1")).thenReturn(claims("u1"));

    mockMvc
        .perform(get("/user/avatar").header("token", "token-1"))
        .andExpect(status().isNotFound());
  }
}
