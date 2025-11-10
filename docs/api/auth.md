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
