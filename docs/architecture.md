# 系统架构蓝图

## 总体视图

健康管理系统采用前后端分离的分层架构，并通过标准化 API 进行通信：

```
┌───────────────────────────────────────────────────────────┐
│                      前端应用 (Nuxt 4)                    │
│  - CSR 仪表盘 / 预渲染公开页                              │
│  - 组合式 API、useState 状态管理                          │
│  - ECharts 可视化、Nuxt UI 组件                           │
└───────────────▲───────────────────────┬───────────────────┘
                │REST / SSE             │
                │统一响应 / JWT / Cookie│
┌───────────────┴───────────────────────▼───────────────────┐
│                    后端服务 (Spring Boot)                 │
│  - 控制器层暴露 REST/SSE 接口                             │
│  - 服务层封装业务逻辑                                     │
│  - MyBatis + PageHelper 数据访问                          │
│  - LoginCheckInterceptor 进行 JWT 校验                    │
│  - Spring AI 调用 DeepSeek API                            │
└───────────────▲───────────────────────┬───────────────────┘
                │JDBC                   │
                │InMemory 会话上下文    │
┌───────────────┴───────────────────────▼───────────────────┐
│                          MySQL                            │
│  - 用户、身体/饮食/运动/睡眠数据持久化                    │
│  - 统一结构化数据源                                       │
└───────────────────────────────────────────────────────────┘
                │
                │HTTPS
┌───────────────▼───────────────────────────────────────────┐
│                    AI 服务 (DeepSeek)                     │
│  - DeepSeek Chat Model (deepseek-chat)                    │
│  - SSE 流式响应                                           │
└───────────────────────────────────────────────────────────┘
```

## 核心组件说明

- **前端 (frontend/)**：
  - 基于 Nuxt 4 组合式 API 实现的 SPA/SSR 混合应用，负责页面渲染、数据可视化和交互逻辑
  - 借助 `useState`、`useCookie`、`useFetch` 等组合式工具管理认证态和数据请求
  - 通过 `server/middleware/api-proxy.ts` 复用运行时 `NUXT_PUBLIC_API_BASE`，无论开发或部署环境都统一将 `/api/*` 请求反向代理到后端
- **后端 (backend/)**：
  - Spring Boot 微服务，遵循 Controller-Service-Mapper 分层
  - 使用 MyBatis + PageHelper 访问 MySQL，统一封装 `Result` 响应结构，拦截器完成 JWT 鉴权
  - 通过 function 将健康数据 CRUD 与联网搜索封装为 Spring AI Function，供模型安全调用
- **数据层**：
  - MySQL 存储结构化健康指标数据和用户资料（覆盖身体/饮食/运动/睡眠）
  - 聊天上下文通过 `UserChatSessionManager` 搭配 `InMemoryChatMemory` 保存在内存中
- **AI 能力**：
  - 借助 Spring AI OpenAI 模块调用 DeepSeek 大模型（DeepSeek-V3.2-Exp），支持 SSE 流式对话
  - `ChatController` 负责对话上下文管理，并注入 `BodyFunctions`、`SleepFunctions`、`DietFunctions`、`ExerciseFunctions` 与 `WebSearchFunction`

- **基础设施**：
  - 容器化部署使用 Docker 与 docker-compose，后端与 MySQL 通过容器网络关联

## 关键业务流程

### 用户认证

1. 用户在前端通过 `/api/auth/login` 发起登录请求（Nitro 中间件/反向代理会转发为后端的 `/auth/login`）
2. 后端验证后签发 JWT，返回标准响应 `Result{code=1, data=token}`
3. 前端通过 Cookie 与 `useState` 持久化 Token，路由中间件 `auth.ts` 根据 Token 控制访问
4. 后端拦截器 `LoginCheckInterceptor` 在每个受保护接口执行校验，并对无效 Token 做统一错误响应
5. 用户可调用白名单接口 `POST /auth/password/reset`，凭昵称 + 邮箱匹配重置密码

### 健康数据采集流程

1. 前端通过 `POST /body-metrics`、`/diet-items`、`/exercise-items`、`/sleep-items` 等接口提交身体、饮食、运动、睡眠信息
2. 后端 Service 层完成参数校验与业务规则，并调用 Mapper 持久化
3. 查询时通过分页接口 `GET /body-metrics` 返回 `PageBean` 结构
4. 前端使用 ECharts 渲染结果，并支持快速录入对话框组件

### AI 咨询流程

1. 前端 `AIChatPalette` 调起 SSE 连接 `POST /chat/stream` 并推送用户问题
2. 后端 `ChatController` 调用 Spring AI，向 DeepSeek 发送上下文提示词，并根据模型需要依次触发 `BodyFunctions` / `SleepFunctions` / `DietFunctions` / `ExerciseFunctions` / `WebSearchFunction`
3. 函数执行结果（例如新增某条运动记录的 ID）会回写到模型上下文，推理结果通过 SSE `data: {...}` 流持续回传
4. SSE 层自带 60 秒超时保护，遇到请求失败会推送友好降级提示
5. 用户可调用 `DELETE /chat/memory` 清空上下文重新开始对话

## 数据流交互

- 所有 REST 响应遵循 `Result` 规范，`code` 为 1 表示成功，0 表示失败
- 身体、饮食、运动等实体遵循数据库字段命名，返回 JSON 采用驼峰命名
- SSE 接口使用 `text/event-stream`，返回对象包含 `content` 字段
- 认证 Token 通过 `Authorization: Bearer <jwt>`、`token` 头或 Cookie 传递

## 部署拓扑

- **开发环境**：
  - 前端：`pnpm dev` 启动后由 Nuxt Nitro `devProxy` 配合 `server/middleware/api-proxy.ts` 统一转发 `/api` 请求到后端
  - 后端：`./gradlew bootRun`，使用本地 MySQL 或 docker-compose

- **生产环境**：
  - 前端构建产物由 Nginx/CDN 托管，反向代理 `/api` 到后端服务
  - 后端运行在容器或虚拟机上，暴露 `8080` 端口，连接托管的 MySQL 实例
  - AI 服务需要配置 `DEEPSEEK_API_KEY`，遵守服务调用限额
  - 建议开启 HTTPS、WAF、日志采集和链路监控

## 安全措施

- **鉴权**：JWT + 拦截器，集中校验所有受保护接口的访问令牌，并通过 `AntPathMatcher` 维护 `/auth/**` 与 `/api/auth/**` 白名单
- **输入校验**：Controller 层对用户输入进行校验，并在 Service 层执行业务验证
- **日志监控**：利用 Spring Boot Actuator 提供健康检查，结合集中化日志便于排错
- **数据保护**：认证信息与敏感字段应在响应中适当脱敏
