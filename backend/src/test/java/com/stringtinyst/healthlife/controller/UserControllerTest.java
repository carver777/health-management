package com.stringtinyst.healthlife.controller;

import static org.hamcrest.Matchers.equalTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stringtinyst.healthlife.service.UserService;
import com.stringtinyst.healthlife.utils.JwtUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UserController.class)
class UserControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private UserService userService;

  @MockBean private JwtUtils jwtUtils;

  @Test
  void loginShouldReturnTokenWhenCredentialsValid() throws Exception {
    given(userService.loginUser(any())).willReturn("user-1");
    given(jwtUtils.generateJwt(anyMap())).willReturn("signed-token");

    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"a@example.com\",\"password\":\"secret\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code", equalTo(1)))
        .andExpect(jsonPath("$.data", equalTo("signed-token")));
  }

  @Test
  void registerShouldReturnErrorWhenUserExists() throws Exception {
    given(userService.registerUser(any())).willReturn(false);

    mockMvc
        .perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"email\":\"a@example.com\",\"password\":\"secret\",\"nickname\":\"nick\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code", equalTo(0)))
        .andExpect(jsonPath("$.msg", equalTo("用户注册失败,已有相同邮箱")));
  }

  @Test
  void resetPasswordShouldValidateInput() throws Exception {
    mockMvc
        .perform(
            post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"nickname\":\"\",\"email\":\"\",\"newPassword\":\"123\",\"confirmPassword\":\"\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code", equalTo(0)))
        .andExpect(jsonPath("$.msg", equalTo("请提供完整的昵称、邮箱、新密码与确认密码信息")));
  }

  @Test
  void resetPasswordShouldFailWhenConfirmMismatch() throws Exception {
    mockMvc
        .perform(
            post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"nickname\":\"Alpha\",\"email\":\"user@example.com\",\"newPassword\":\"newSecret\",\"confirmPassword\":\"other\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code", equalTo(0)))
        .andExpect(jsonPath("$.msg", equalTo("两次输入的密码不一致")));
  }

  @Test
  void resetPasswordShouldReturnErrorWhenMismatch() throws Exception {
    given(userService.resetPassword(anyString(), anyString(), anyString())).willReturn(false);

    mockMvc
        .perform(
            post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"nickname\":\"Alpha\",\"email\":\"user@example.com\",\"newPassword\":\"newSecret\",\"confirmPassword\":\"newSecret\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code", equalTo(0)))
        .andExpect(jsonPath("$.msg", equalTo("昵称与邮箱不匹配，无法修改密码")));
  }

  @Test
  void resetPasswordShouldReturnSuccessWhenUpdated() throws Exception {
    given(userService.resetPassword(anyString(), anyString(), anyString())).willReturn(true);

    mockMvc
        .perform(
            post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"nickname\":\"Alpha\",\"email\":\"user@example.com\",\"newPassword\":\"newSecret\",\"confirmPassword\":\"newSecret\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code", equalTo(1)))
        .andExpect(jsonPath("$.msg", equalTo("success")));
  }
}
