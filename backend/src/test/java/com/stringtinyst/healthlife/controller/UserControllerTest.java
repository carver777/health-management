package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.pojo.User;
import com.stringtinyst.healthlife.service.UserService;
import com.stringtinyst.healthlife.utils.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
class UserControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private UserService userService;
  @MockitoBean private JwtUtils jwtUtils;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper().findAndRegisterModules();
    // /auth 登录注册在拦截器白名单，仍将其放行以防切片加载到拦截器。
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  @Test
  @DisplayName("注册成功返回 userID")
  void registerUser_success() throws Exception {
    when(userService.registerUser(any(User.class))).thenReturn(true);

    String payload =
        objectMapper.writeValueAsString(
            new TestRegisterPayload("user@example.com", "123456", "Tom"));

    mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.msg").value("success"))
        .andExpect(jsonPath("$.data").isNotEmpty());
  }

  @Test
  @DisplayName("注册重复邮箱返回错误")
  void registerUser_duplicateEmail() throws Exception {
    when(userService.registerUser(any(User.class))).thenReturn(false);

    String payload =
        objectMapper.writeValueAsString(
            new TestRegisterPayload("dup@example.com", "pwd", "Dup"));

    mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(0))
        .andExpect(jsonPath("$.msg").value("用户注册失败,已有相同邮箱"));
  }

  @Test
  @DisplayName("登录成功返回 JWT")
  void loginUser_success() throws Exception {
    when(userService.loginUser(any(User.class))).thenReturn("uid-1");
    when(jwtUtils.generateJwt(Mockito.anyMap())).thenReturn("token-123");

    String payload =
        objectMapper.writeValueAsString(new TestLoginPayload("login@example.com", "pwd"));

    mockMvc
        .perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data").value("token-123"));
  }

  @Test
  @DisplayName("登录用户不存在")
  void loginUser_notFound() throws Exception {
    when(userService.loginUser(any(User.class))).thenThrow(new RuntimeException("USER_NOT_FOUND"));

    String payload =
        objectMapper.writeValueAsString(new TestLoginPayload("nouser@example.com", "pwd"));

    mockMvc
        .perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(0))
        .andExpect(jsonPath("$.msg").value("用户不存在，请先注册"));
  }

  private record TestRegisterPayload(String email, String password, String nickname) {}

  private record TestLoginPayload(String email, String password) {}
}