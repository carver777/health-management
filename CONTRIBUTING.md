# 贡献指南

欢迎参与健康管理系统的开发！本文档将帮助你快速上手

## 开始之前

在开始贡献之前，请：

1. 阅读 [README](./README.md) 了解项目概况
2. 查看 [系统架构蓝图](./docs/architecture.md) 掌握整体设计以及项目所用技术栈
3. 查看 [项目路线图](./docs/roadmap.md) 了解开发计划
4. 浏览 [API 文档预览](./docs/api/overview.md) 熟悉项目接口文档

## 开发环境

详细的环境搭建步骤请查看：

- [前端开发指南](./frontend/README.md)
- [后端开发指南](./backend/README.md)

## 工作流程

### 1. 创建分支

从 `main` 分支创建功能分支或修复分支：

```bash
git checkout main
git pull origin main
git checkout -b feat/feature-name  # 或 fix/bug-name
```

**分支命名**：

- 功能：`feat/feature-name`
- 修复：`fix/bug-name`

### 2. 开发与提交

遵循项目的提交规范进行开发，详见 [提交规范](./docs/git-commit-guide.md)。

```bash
git commit -m "feat: 描述信息"
```

### 3. 推送与 PR

```bash
git push origin feat/feature-name
```

然后在 GitHub 创建 Pull Request 到 `main` 分支。

## 代码规范

### 前端

- TypeScript 严格模式
- Vue 3 组合式 API
- ESLint + Prettier

提交前检查：

```bash
cd frontend
pnpm lint        # 代码检查并修复
pnpm format      # 代码格式化
pnpm typecheck   # 类型检查
pnpm test:run    # 单元测试
pnpm test:e2e    # E2E 测试
pnpm api:test    # API 回归测试
```

### 后端

- Java 17
- 阿里巴巴 Java 规范
- 命名：类 `PascalCase`，方法 `camelCase`，常量 `UPPER_SNAKE_CASE`

## Pull Request

### 提交要求

- 代码检查通过
- 类型检查通过
- 单元测试通过
- E2E 测试通过
- 填写完整的 PR 描述

### PR 模板

```markdown
## 改动说明
简要描述本次改动的内容

## 改动类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 代码重构
- [ ] 文档更新
- [ ] 测试覆盖

## 测试情况
- [ ] 本地测试通过
- [ ] 代码检查通过
- [ ] 类型检查通过
- [ ] 单元测试通过
- [ ] E2E 测试通过

## 相关 Issue
#issue_number（如有）
```

## 开发建议

- **原子提交**：一个提交只做一件事
- **及时提交**：避免积累过多改动
- **清晰代码**：优先考虑可读性
- **必要注释**：特别是复杂逻辑
- **友好沟通**：遇到问题及时讨论
