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

### 图表与可视化

- **ECharts** - 数据可视化图表库
- **Marked** - Markdown 解析器
- **DOMPurify** - XSS 防护

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Vitest** - 单元测试框架

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
│   │   └── QuickExerciseDialog.vue   # 快速记录运动
│   ├── composables/
│   │   ├── useAuth.ts                # 认证状态管理
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
│   │   ├── chat.vue                  # AI 咨询（CSR）
│   │   └── profile.vue               # 个人中心（CSR）
│   ├── plugins/
│   │   └── auth.client.ts            # 客户端认证插件
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
├── public/                           # 静态资源
├── nuxt.config.ts                    # Nuxt 配置
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

### 开发环境启动

参考 `.env.example` 配置相关环境变量，接着输入如下命令：

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动

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
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# Prettier 检查
pnpm format

# Prettier 格式化代码
pnpm format:fix

# TypeScript 类型检查
pnpm typecheck
```

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

### 类型安全

- 全面使用 TypeScript 开发
- 完整的类型定义和编译时检查
- API 响应类型化
- 组件 Props 类型安全

### 代码规范

- ESLint + Prettier
- 统一的代码风格
- 自动格式化

## API 配置

### 开发环境代理

编辑 `.env` 文件，默认转发到 `localhost`，需自行配置后端 ip

### 生产环境

生产环境中，前端静态文件通过 Nginx 等 Web 服务器代理到后端 API

## UI 设计

- 基于 Nuxt UI 组件库
- 一致的视觉风格

## 认证机制

- JWT Token 认证
- 客户端启动时自动初始化认证状态
- 路由守卫保护
- 登录状态持久化（Cookie + useState）
