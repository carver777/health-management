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

全局拦截器基于 `AntPathMatcher` 维护一份白名单，默认允许 `/actuator/**`、`/error`、`/auth/login`、`/auth/register`、`/auth/password/reset`，以及为了兼容反向代理场景而保留的 `/api/auth/login`、`/api/auth/register`、`/api/auth/password/reset`，其余接口必须携带 token：

- `Authorization: Bearer <jwt>`
- 或自定义头 `token: <jwt>`
- 或 Cookie `token=<jwt>`

缺少或无效 token 时响应 `{"code":0,"msg":"未登录或登录已过期，请重新登录"}`。昵称 + 邮箱重置密码接口虽无需 token，但会校验两者是否匹配

## 文档结构

- [auth.md](./auth.md)：认证相关接口
- [user.md](./user.md)：用户信息与头像接口
- [body-metrics.md](./body-metrics.md)：身体数据接口
- [diet-items.md](./diet-items.md)：饮食记录接口
- [exercise-items.md](./exercise-items.md)：运动记录接口
- [sleep-items.md](./sleep-items.md)：睡眠记录接口
- [chat.md](./chat.md)：AI 聊天接口

## AI 助手函数能力

`POST /chat/stream` 会在系统提示中附带服务器当前日期与时间，并自动调用一组受控函数来读写用户的健康数据，避免再通过前端绕行 REST 接口：

- 身体数据：`queryBodyMetrics`、`addBodyMetric`、`getBodyMetricDetail`、`updateBodyMetric`、`deleteBodyMetric`
- 睡眠数据：`querySleepRecords`、`addSleepRecord`、`updateSleepRecord`、`getSleepRecordDetail`、`deleteSleepRecord`
- 饮食数据：`queryDietRecords`、`addDietRecord`、`updateDietRecord`、`getDietRecordDetail`、`deleteDietRecord`
- 运动数据：`queryExerciseRecords`、`addExerciseRecord`、`updateExerciseRecord`、`getExerciseRecordDetail`、`deleteExerciseRecord`
- 联网搜索：`webSearch`（可返回实时健康/运动资讯）

这些函数与对应的 REST API 使用同一套参数校验与业务规则，最终仍会透传到文档中列出的实体接口中。

> 如需关闭联网搜索，可在 `application.properties` 中设置 `web.search.enabled=false`

## 服务端数据校验

- 体征、饮食、运动、睡眠等记录接口会在 Controller 层对关键字段做范围与顺序校验
- 当校验失败时接口仍返回 `200`，但 `code = 0` 且 `msg` 包含具体原因
- 前端继续保留表单校验，后端校验作为兜底
