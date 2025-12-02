# 认证接口

## `POST /auth/register`

用户注册

- **请求体**：

  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "nickname": "yournickname",
    "gender": "Male",
    "dateOfBirth": "YYYY-MM-DD"
  }
  ```

  字段 `nickname` 可用 `username` 替代；`gender`、`dateOfBirth` 可选
  后端会自动补充 `registrationDate` 字段，无需手动提交

- **成功响应**：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": "generated-user-uuid"
  }
  ```

- **失败响应**：邮箱重复时返回

  ```json
  {
    "code": 0,
    "msg": "用户注册失败,已有相同邮箱",
    "data": null
  }
  ```

## `POST /auth/login`

用户登录，返回 JWT

- **请求体**：

  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

- **成功响应**：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": "jwt-token-string"
  }
  ```

- **失败响应**：

  - 用户不存在：`{"code":0,"msg":"用户不存在，请先注册","data":null}`
  - 密码错误：`{"code":0,"msg":"密码错误，请重新输入","data":null}`
  - 其他异常：`{"code":0,"msg":"登录失败，请稍后重试","data":null}`

## `POST /auth/password/reset`

根据昵称与邮箱重置密码

- **请求体**：

  ```json
  {
    "nickname": "yournickname",
    "email": "user@example.com",
    "newPassword": "your-new-password",
    "confirmPassword": "your-new-password"
  }
  ```

  - `newPassword` 至少 6 个字符
  - `confirmPassword` 必须与 `newPassword` 完全一致

- **成功响应**：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": null
  }
  ```

- **失败响应**：

  - 参数缺失或不合法：`{"code":0,"msg":"请提供完整的昵称、邮箱、新密码与确认密码信息","data":null}`
  - 两次密码不一致：`{"code":0,"msg":"两次输入的密码不一致","data":null}`
  - 昵称与邮箱不匹配：`{"code":0,"msg":"昵称与邮箱不匹配，无法修改密码","data":null}`
