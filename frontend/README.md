# 前端开发指南

## 技术栈

### 核心框架

- **Vue 3** - 渐进式 JavaScript 框架，使用组合式 API
- **Nuxt 4** - Vue 全栈框架，提供 SSR、文件路由等功能
- **TypeScript** - 类型安全的 JavaScript 超集

### UI 与样式

- **NuxtUI** - 基于 Headless UI 和 Tailwind CSS 的组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Nuxt Icon** - 图标解决方案

### 状态管理与数据请求

- **useState** - Nuxt 内置的状态管理
- **useFetch** - Nuxt 内置的数据请求组合式函数
- **useCookie** - Nuxt 内置的 Cookie 管理

### 认证机制

- JWT Token 认证
- 客户端启动时自动初始化认证状态
- 路由守卫保护
- 登录状态持久化（Cookie + useState）
- 提供昵称 + 邮箱密码重置

### 图表与可视化

- **ECharts** - 数据可视化图表库
- **Marked** - Markdown 解析器
- **DOMPurify** - XSS 防护

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试框架

## 架构特性

### 混合渲染策略

采用 Nuxt 4 推荐的混合渲染模式，针对不同页面使用最佳渲染策略：

- **预渲染** (`prerender: true`): 公开页面（首页、登录页）
  - SEO 优化
  - 快速首屏加载
  - 静态 HTML，可部署到 CDN

- **客户端渲染** (`ssr: false`): 后台管理页面
  - 无服务器负载
  - 无水合开销
  - 更流畅的交互体验
  - 适合高度交互的应用

### 状态管理

遵循 Nuxt 4 最佳实践，使用原生 Composables：

- `useState`: SSR 友好的状态管理
- `useCookie`: 自动同步的 Cookie 管理
- `readonly()`: 保护状态不被外部修改
- 完整的 TypeScript 类型支持

### 性能优化

- **懒加载**: 组件、对话框按需加载
- **水合延迟**: 图表组件使用 `hydrate-on-visible`
- **代码分割**: 按路由自动分割代码
- **预渲染**: 公开页面静态化
- **客户端专用组件**: `.client.vue` 后缀组件

### 流式通信

- `utils/sse.ts` 统一管理基于 Fetch 与 EventSource 的 SSE 订阅
- 异步队列缓冲分片，确保 AI 消息严格按顺序渲染
- 连接异常、超时、用户中止时主动结束流并抛出友好错误

### 统一 API 代理

- `nitro.devProxy` 在开发模式下将 `/api/*` 请求直接代理到配置的后端地址
- `server/middleware/api-proxy.ts` 在 Nitro Server 中兜底：无论是 SSR、Serverless 还是 edge 部署，都会复用同一配置转发请求并透传鉴权头

### 类型安全

- 全面使用 TypeScript 开发
- 完整的类型定义和编译时检查
- API 响应类型化
- 组件 Props 类型安全

### 代码规范

- ESLint + Prettier
- 统一的代码风格
- 自动格式化

## 项目结构

```
health-management/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css              # 全局样式
│   ├── components/
│   │   ├── AIChatPalette.vue         # AI 助手快捷入口
│   │   ├── CaloriesChart.client.vue  # 卡路里图表（客户端）
│   │   ├── WeightChart.client.vue    # 体重图表（客户端）
│   │   ├── DatePicker.vue            # 日期选择器（对年月选择器的封装）
│   │   ├── YearMonthSelect.vue       # 年月选择器
│   │   ├── QuickBodyDataDialog.vue   # 快速记录体重
│   │   ├── QuickDietDialog.vue       # 快速记录饮食
│   │   ├── QuickExerciseDialog.vue   # 快速记录运动
│   │   └── QuickSleepDialog.vue      # 快速记录睡眠
│   ├── composables/
│   │   ├── useAuth.ts                # 认证状态管理
│   │   ├── useAvatar.ts              # 头像状态检测与 URL 缓存
│   │   └── useECharts.ts             # ECharts 配置
│   ├── layouts/
│   │   ├── blank.vue                 # 空白布局（登录页）
│   │   └── default.vue               # 默认布局（导航栏）
│   ├── middleware/
│   │   └── auth.ts                   # 认证中间件
│   ├── pages/
│   │   ├── index.vue                 # 首页（预渲染）
│   │   ├── login.vue                 # 登录/注册（预渲染）
│   │   ├── dashboard.vue             # 数据概览（CSR）
│   │   ├── body-data.vue             # 身体数据（CSR）
│   │   ├── diet.vue                  # 饮食管理（CSR）
│   │   ├── exercise.vue              # 运动管理（CSR）
│   │   ├── sleep.vue                 # 睡眠管理（CSR）
│   │   ├── chat.vue                  # AI 咨询（CSR）
│   │   └── profile.vue               # 个人中心（CSR）
│   ├── plugins/
│   │   └── auth.client.ts            # 客户端认证插件
│   ├── tests/                        # 单元测试
│   │   ├── dateUtils.spec.ts
│   │   ├── metricUtils.spec.ts
│   │   ├── sse.spec.ts
│   │   ├── components/               # 组件测试
│   │   └── composables/              # Composables 测试
│   ├── types/
│   │   └── index.ts                  # TypeScript 类型定义
│   ├── utils/
│   │   ├── dateUtils.ts              # 日期工具函数
│   │   ├── metricUtils.ts            # 指标计算工具
│   │   └── sse.ts                    # SSE 流式请求
│   ├── app.config.ts                 # 应用配置
│   ├── app.vue                       # 根组件
│   ├── error.vue                     # 错误页面
│   └── spa-loading-template.html     # SPA 加载模板
├── server/
│   └── middleware/
│       └── api-proxy.ts              # Nitro Server 反向代理 `/api/*`
├── e2e/                              # E2E 测试（Playwright）
│   ├── home.spec.ts                  # 首页测试
│   └── login.spec.ts                 # 登录/注册页测试
├── postman/                          # API 测试（Newman/Postman）
│   ├── api.postman_collection.json     # API 集合
│   ├── local.postman_environment.json  # 本地环境变量
│   └── avatar.png                      # 头像上传占位图
├── public/                           # 静态资源
├── nuxt.config.ts                    # Nuxt 配置
├── playwright.config.ts              # Playwright 配置
├── vitest.config.ts                  # Vitest 配置
├── tsconfig.json                     # TypeScript 配置
├── eslint.config.mjs                 # ESLint 配置
├── package.json                      # 项目依赖
└── pnpm-lock.yaml                    # 依赖锁定文件
```

## 快速开始

### 环境要求

- Node.js >= 22.0.0
- pnpm >= 10.0.0

### 安装依赖

```bash
pnpm install
```

### 运行项目

参考 `.env.example` 配置相关环境变量，接着输入如下命令：

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动

> 开发模式自动使用非 secure cookie，无需额外配置；如需联调不同后端环境，设置 `NUXT_PUBLIC_API_BASE` 即可

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 代码检查与格式化

```bash
# ESLint 自动修复
pnpm lint

# Prettier 格式化代码
pnpm format

# TypeScript 类型检查
pnpm typecheck
```

### 单元测试

```bash
# 运行测试（监听模式）
pnpm test

# 运行测试（单次执行）
pnpm test:run

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

测试文件位于 `app/tests/` 目录，覆盖：

- **工具函数**: `dateUtils.spec.ts`, `metricUtils.spec.ts`, `sse.spec.ts`
- **Composables**: `composables/useAuth.spec.ts`, `composables/useECharts.spec.ts`
- **组件**: `components/*.spec.ts` (DatePicker, YearMonthSelect, QuickBodyDataDialog 等)

覆盖率报告生成在 `coverage/` 目录

### E2E 测试

使用 Playwright 进行端到端测试，测试文件位于 `e2e/` 目录：

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 以 UI 模式运行（可视化调试）
pnpm test:e2e:ui

# 其他选项（通过 -- 传递参数）
pnpm test:e2e -- --headed      # 显示浏览器
pnpm test:e2e -- --debug       # 调试模式
```

测试覆盖：

- **首页**: 页面元素、导航功能
- **登录/注册页**: 表单显示、输入验证、页面切换

### Postman 测试

`./postman/` 目录提供了一套与页面调用保持一致的 Postman 集合，并预置：

- `avatar.png`：供头像上传接口使用的占位图片（路径写在环境变量 `avatarPath` 内）
- `wrongPassword`、`invalidWeight`、`invalidBedTime` 等变量：用于错误数据用例，覆盖常见的输入非法场景

运行 `pnpm api:test`，命令会自动调用 `postman/api.postman_collection.json` 与 `postman/local.postman_environment.json`

若需自定义参数，可追加 Newman 原生选项，例如：

```bash
pnpm api:test --reporters cli,html --reporter-html-export ./newman-report.html
```

环境变量可在 JSON 文件内修改，或通过 `pnpm api:test --env-var baseUrl=https://api.example.com` 临时覆盖；若要验证更多错误数据，可新增变量并在集合里引用即可
