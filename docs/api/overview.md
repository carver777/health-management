# API 概览

本文档概述 Health Management 系统的接口通用约定

## 统一响应结构

除特殊说明外，所有接口返回 `200 OK`，响应体形如：

```json
{
  "code": 1,
  "msg": "success",
  "data": null
}
```

- `code`：`1` 表示成功，`0` 表示失败或业务校验未通过
- `msg`：文本提示，失败时包含具体原因
- `data`：业务负载，部分查询在找不到数据时会返回 `null` 而仍保持 `code = 1`

> 当前实现不会使用 `401` 等 HTTP 状态码指示鉴权失败，所有错误都会以 `200` 返回

## 鉴权约定

全局拦截器要求除 `/auth/login`、`/auth/register`、`/actuator/**`、`/error` 外的接口必须提供 token：

- `Authorization: Bearer <jwt>`
- 或自定义头 `token: <jwt>`
- 或 Cookie `token=<jwt>`

缺少或无效 token 时响应 `{"code":0,"msg":"未登录或登录已过期，请重新登录"}`

## 文档结构

- [auth.md](./auth.md)：认证相关接口
- [user.md](./user.md)：用户信息与头像接口
- [body-metrics.md](./body-metrics.md)：身体数据接口
- [diet-items.md](./diet-items.md)：饮食记录接口
- [exercise-items.md](./exercise-items.md)：运动记录接口
- [chat.md](./chat.md)：AI 聊天接口
