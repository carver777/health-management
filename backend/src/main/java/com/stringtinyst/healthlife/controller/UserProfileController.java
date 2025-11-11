package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.pojo.User;
import com.stringtinyst.healthlife.service.UserService;
import com.stringtinyst.healthlife.utils.JwtUtils;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserProfileController {
  @Autowired private UserService userService;
  @Autowired private JwtUtils jwtUtils;

  @GetMapping("/profile")
  public Result getUserProfile(@RequestHeader("Authorization") String authorization) {
    String jwtToken = authorization.replace("Bearer ", "");
    String userId = extractUserIdFromToken(jwtToken);

    User userInfo = userService.getUser(userId);
    if (userInfo == null) {
      return Result.error("用户不存在");
    }
    return Result.success(userInfo);
  }

  @PutMapping("/profile")
  public Result updateUserProfile(
      @RequestHeader("Authorization") String authorization, @RequestBody User user) {
    String jwtToken = authorization.replace("Bearer ", "");
    String userId = extractUserIdFromToken(jwtToken);

    user.setUserID(userId);
    boolean flag = userService.updateUser(user);
    if (!flag) {
      return Result.error("用户更新失败");
    }
    return Result.success(user);
  }

  @GetMapping("/{userID}")
  public Result getUser(@PathVariable String userID) {
    User userInfo = userService.getUser(userID);
    if (userInfo == null) {
      return Result.error("用户不存在");
    }
    return Result.success(userInfo);
  }

  @PutMapping("/{userID}")
  public Result updateUser(@PathVariable String userID, @RequestBody User user) {
    user.setUserID(userID);
    boolean flag = userService.updateUser(user);
    if (!flag) {
      return Result.error("用户更新失败");
    }
    return Result.success(user);
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
      log.error("提取 userID 失败: {}", e.getMessage());
      throw new IllegalArgumentException("无效的 token 或 token 中无 userId");
    }
  }
}
