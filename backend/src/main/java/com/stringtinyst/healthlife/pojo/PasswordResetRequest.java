package com.stringtinyst.healthlife.pojo;

import lombok.Data;

/** 密码重置请求体 */
@Data
public class PasswordResetRequest {
  private String nickname;
  private String email;
  private String newPassword;
  private String confirmPassword;
}
