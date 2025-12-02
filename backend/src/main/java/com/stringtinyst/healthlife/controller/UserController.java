package com.stringtinyst.healthlife.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.stringtinyst.healthlife.pojo.PasswordResetRequest;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.pojo.User;
import com.stringtinyst.healthlife.service.UserService;
import com.stringtinyst.healthlife.utils.JwtUtils;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
public class UserController {
  @Autowired private UserService userService;

  @Autowired private JwtUtils jwtUtils;

  @PostMapping("/register")
  public Result registerUser(@RequestBody JsonNode body) {
    User user = new User();
    user.setUserID(UUID.randomUUID().toString());
    user.setEmail(body.get("email").asText());
    user.setPasswordHash(body.get("password").asText());
    user.setRegistrationDate(LocalDate.now());

    if (body.has("nickname")) {
      user.setNickname(body.get("nickname").asText());
    } else if (body.has("username")) {
      user.setNickname(body.get("username").asText());
    }

    if (body.has("gender")) {
      user.setGender(body.get("gender").asText());
    }

    if (body.has("dateOfBirth")) {
      try {
        user.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth").asText()));
      } catch (Exception e) {
        log.warn("解析出生日期失败: {}", body.get("dateOfBirth").asText());
      }
    }

    boolean flag = userService.registerUser(user);

    if (!flag) {
      return Result.error("用户注册失败,已有相同邮箱");
    }
    return Result.success(user.getUserID());
  }

  @PostMapping("/login")
  public Result loginUser(@RequestBody JsonNode body) {
    User user = new User();
    user.setEmail(body.get("email").asText());
    user.setPasswordHash(body.get("password").asText());

    try {
      String loginUser = userService.loginUser(user);
      user.setUserID(loginUser);
      Map<String, Object> claims = new HashMap<>();
      claims.put("userID", user.getUserID());
      claims.put("email", user.getEmail());
      String token = jwtUtils.generateJwt(claims);
      return Result.success(token);
    } catch (RuntimeException e) {
      log.error("用户登录失败: email={}, reason={}", user.getEmail(), e.getMessage());

      if ("USER_NOT_FOUND".equals(e.getMessage())) {
        return Result.error("用户不存在，请先注册");
      } else if ("PASSWORD_INCORRECT".equals(e.getMessage())) {
        return Result.error("密码错误，请重新输入");
      } else {
        return Result.error("登录失败，请稍后重试");
      }
    }
  }

  @PostMapping("/password/reset")
  public Result resetPassword(@RequestBody PasswordResetRequest request) {
    if (request == null
        || !StringUtils.hasText(request.getNickname())
        || !StringUtils.hasText(request.getEmail())
        || !StringUtils.hasText(request.getNewPassword())
        || !StringUtils.hasText(request.getConfirmPassword())) {
      return Result.error("请提供完整的昵称、邮箱、新密码与确认密码信息");
    }

    if (request.getNewPassword().length() < 6) {
      return Result.error("新密码长度至少 6 个字符");
    }

    if (!request.getNewPassword().equals(request.getConfirmPassword())) {
      return Result.error("两次输入的密码不一致");
    }

    boolean updated =
        userService.resetPassword(
            request.getNickname(), request.getEmail(), request.getNewPassword());
    if (!updated) {
      return Result.error("昵称与邮箱不匹配，无法修改密码");
    }
    return Result.success();
  }
}
