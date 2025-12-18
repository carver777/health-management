package com.stringtinyst.healthlife.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import com.stringtinyst.healthlife.pojo.User;
import com.stringtinyst.healthlife.service.UserService;
import com.stringtinyst.healthlife.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserProfileController.class)
class UserProfileControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private UserService userService;
  @MockitoBean private JwtUtils jwtUtils;
  @MockitoBean private LoginCheckInterceptor loginCheckInterceptor;

  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() throws Exception {
    objectMapper = new ObjectMapper().findAndRegisterModules();
    when(loginCheckInterceptor.preHandle(any(), any(), any())).thenReturn(true);
  }

  private Claims claims(String userId) {
    DefaultClaims claims = new DefaultClaims();
    claims.put("userID", userId);
    claims.put("email", userId + "@example.com");
    return claims;
  }

  @Test
  @DisplayName("获取用户资料成功")
  void getProfile_success() throws Exception {
    when(jwtUtils.parseJWT("token-1")).thenReturn(claims("u1"));
    User user =
        new User("u1", "u1@example.com", null, "Tom", "M", LocalDate.parse("1990-01-01"), null);
    when(userService.getUser("u1")).thenReturn(user);

    mockMvc
        .perform(get("/user/profile").header("Authorization", "Bearer token-1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data.userID").value("u1"))
        .andExpect(jsonPath("$.data.nickname").value("Tom"));
  }

  @Test
  @DisplayName("获取用户资料不存在")
  void getProfile_notFound() throws Exception {
    when(jwtUtils.parseJWT("token-404")).thenReturn(claims("u404"));
    when(userService.getUser("u404")).thenReturn(null);

    mockMvc
        .perform(get("/user/profile").header("Authorization", "Bearer token-404"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(0))
        .andExpect(jsonPath("$.msg").value("用户不存在"));
  }

  @Test
  @DisplayName("更新用户资料成功")
  void updateProfile_success() throws Exception {
    when(jwtUtils.parseJWT("token-2")).thenReturn(claims("u2"));
    when(userService.updateUser(any(User.class))).thenReturn(true);

    User update = new User(null, null, null, "Jerry", "M", LocalDate.parse("1991-02-02"), null);
    String payload = objectMapper.writeValueAsString(update);

    mockMvc
        .perform(
            put("/user/profile")
                .header("Authorization", "Bearer token-2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(1))
        .andExpect(jsonPath("$.data.nickname").value("Jerry"))
        .andExpect(jsonPath("$.data.userID").value("u2"));
  }

  @Test
  @DisplayName("更新用户资料失败")
  void updateProfile_fail() throws Exception {
    when(jwtUtils.parseJWT("token-3")).thenReturn(claims("u3"));
    when(userService.updateUser(any(User.class))).thenReturn(false);

    User update = new User(null, null, null, "Fail", null, null, null);
    String payload = objectMapper.writeValueAsString(update);

    mockMvc
        .perform(
            put("/user/profile")
                .header("Authorization", "Bearer token-3")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(0))
        .andExpect(jsonPath("$.msg").value("用户更新失败"));
  }
}
