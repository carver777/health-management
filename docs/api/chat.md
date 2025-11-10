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

- **请求体缺少或为空 `query`**：立即推送 `data: {"content":"消息不能为空"}`，随后发送 `event: close`

## `DELETE /chat/memory`

清除当前用户的聊天上下文

- **请求头**：`Authorization: Bearer <jwt>`
- **成功响应**：`{"code":1,"msg":"success","data":"已开始新对话"}`
- **token 失效或缺失**：全局拦截器返回 `{"code":0,"msg":"登录已过期，请重新登录"}`
