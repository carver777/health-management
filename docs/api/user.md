# 用户接口

## `GET /user/profile`

获取当前登录用户信息

- **请求头**：`Authorization: Bearer <jwt>`（或 `token` / Cookie `token`）
- **成功响应**：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": {
      "userID": "user-uuid-string",
      "email": "user@example.com",
      "passwordHash": "hash==$salt",
      "nickname": "yournickname",
      "gender": "Male",
      "dateOfBirth": "YYYY-MM-DD",
      "registrationDate": "YYYY-MM-DD"
    }
  }
  ```

  > 当前实现会返回 `passwordHash` 字段，如需隐藏需在后端过滤
  > 字段 `registrationDate` 为后端自动生成的注册日期，只读不可修改

- **鉴权失败**：`{"code":0,"msg":"未登录或登录已过期，请重新登录"}`

## `PUT /user/profile`

更新当前用户信息，未提供的字段会被置为 `null`

- **请求体**：符合 `User` 结构的部分字段，例如

  ```json
  {
    "nickname": "tester-updated"
  }
  ```

  字段 `registrationDate` 由后端维护，无需也不应在请求体中传入

- **成功响应**：返回更新后的用户对象，示例

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": {
      "userID": "user-uuid-string",
      "email": null,
      "passwordHash": null,
      "nickname": "tester-updated",
      "gender": null,
      "dateOfBirth": null,
      "registrationDate": "2025-06-24"
    }
  }
  ```

- **失败响应**：更新失败时返回 `{"code":0,"msg":"用户更新失败","data":null}`

## `GET /user/{userID}`

按用户 ID 查询

- **成功响应**：结构与 `GET /user/profile` 相同
- **失败响应**：`{"code":0,"msg":"用户不存在","data":null}`

## `PUT /user/{userID}`

按用户 ID 更新用户，行为与 `PUT /user/profile` 相同

## `POST /user/avatar`

上传头像文件

- **请求头**：`token: <jwt>` 或其他鉴权头；`Content-Type: multipart/form-data`
- **字段**：文件字段名为 `avatar`
- **成功响应**：`{"code":1,"msg":"success","data":"头像上传成功"}`
- **失败响应**：示例 `{"code":0,"msg":"上传的头像文件为空","data":null}`、`{"code":0,"msg":"头像上传失败: 详细错误","data":null}`

## `GET /user/avatar`

获取头像文件，成功时直接返回二进制流

- **失败情况**：
  - 未鉴权：返回 JSON `code = 0`
  - 文件缺失：`404`
  - 读取失败：`500`

## `HEAD /user/avatar`

用于在不下载文件的情况下探测头像是否存在

- **响应**：头像存在时返回 `200 OK` 且无响应体；不存在或读取异常时返回 `404` / `500`
- **鉴权失败**：返回 `401`，无响应体
