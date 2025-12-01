# AI 聊天接口

## `POST /chat/stream`

与 AI 对话（Server-Sent Events）

- **请求头**：`Authorization: Bearer <jwt>`
- **请求体**：

  ```json
  {
    "query": "你的问题"
  }
  ```

- **成功响应**：`Content-Type: text/event-stream`，服务端会持续推送形如

  ```text
  data: {"content":"你好"}

  data: {"content":"很高兴见到你。有什么我可以帮助你的吗？"}

  event: close

  ```

  事件之间以空行分隔

- **流转超时**：若 60 秒内后端未能继续发送分片，将自动终止本次响应并推送 `{"content":"AI 服务响应超时，请稍后重试"}`
- **AI 不可用**：当模型返回 `503` / `429` 等错误时，会推送友好提示，随后关闭连接

- **请求体缺少或为空 `query`**：立即推送 `data: {"content":"消息不能为空"}`，随后发送 `event: close`

## AI 工具清单

聊天接口会在系统提示中附带当前服务器日期与时间，因此无需额外函数即可获取今日日期。以下 Spring AI Function 会根据上下文自动调用：

| 功能域 | 函数 | 说明 |
| --- | --- | --- |
| 身体数据 | `queryBodyMetrics` / `addBodyMetric` | 查询或新增身高体重记录 |
| 睡眠数据 | `querySleepRecords` / `addSleepRecord` / `updateSleepRecord` | 查询、添加或修改睡眠记录，自动校验时间顺序 |
| 饮食数据 | `queryDietRecords` / `addDietRecord` / `updateDietRecord` | 管理饮食记录与卡路里估算 |
| 运动数据 | `queryExerciseRecords` / `addExerciseRecord` / `updateExerciseRecord` | 仅支持预置的 15 种运动类型，新增后返回自增 ID |
| 联网搜索 | `webSearch` | 通过 DuckDuckGo 获取实时健康资讯，可通过 `web.search.enabled` 开关禁用 |

当用户让 AI “帮我记一条运动记录”或“查下昨天的睡眠”，后台会在保证权限的前提下直接调用对应函数并持久化，生成的执行结果会连同行为说明一起通过 SSE 返回

## `DELETE /chat/memory`

清除当前用户的聊天上下文

- **请求头**：`Authorization: Bearer <jwt>`
- **成功响应**：`{"code":1,"msg":"success","data":"已开始新对话"}`
- **token 失效或缺失**：全局拦截器返回 `{"code":0,"msg":"登录已过期，请重新登录"}`
