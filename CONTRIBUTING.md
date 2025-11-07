# 贡献指南

## 开始之前

在开始贡献之前，请确保：

1. 阅读项目的 [README](./README.md) 了解项目概况
2. 查看 [项目路线图](./docs/roadmap.md) 了解开发计划
3. 熟悉项目使用的技术栈

## 开发环境搭建

详细的环境搭建步骤请查看：

- [前端开发指南](./frontend/README.md)
- [后端开发指南](./backend/README.md)

## 分支管理

本项目采用如下分支管理策略：

### 主要分支

- `main`: 主分支，保护分支，仅用于发布稳定版本
- `feat/*`: 功能开发分支，完成后需合并回 `main`
- `fix/*`: Bug 修复分支，完成后需合并回 `main`

### 分支命名规范

功能开发分支：

```
feat/user-login
feat/body-data-tracking
feat/diet-management
```

Bug 修复分支：

```
fix/user-login-error
fix/data-delete-issue
fix/chart-display-bug
```

### 工作流程

1. 从 `main` 创建新分支

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/feature-name
   ```

2. 在分支上开发并提交

   ```bash
   git commit -m "[feat](模块名): 功能描述"
   ```

3. 推送到远程仓库

   ```bash
   git push origin feat/feature-name
   ```

4. 创建 Pull Request 到 `main`

## 提交规范

本项目使用统一的提交信息格式，详见 [Git 提交规范](./docs/git-commit-guide.md)。

### 提交信息格式

```
[类型](模块): 简短描述

详细描述（可选）
```

### 类型说明

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

### 示例

```bash
git commit -m "[feat](用户模块): 新增登录功能"
git commit -m "[fix](数据管理): 修复体重数据无法删除的问题"
git commit -m "[docs](README): 更新项目简介"
```

## 代码规范

### 前端代码规范

- 使用 TypeScript 严格模式
- 遵循 Vue 3 组合式 API 最佳实践
- 组件名使用 PascalCase
- 使用 ESLint + Prettier 格式化代码

提交前执行：

```bash
cd frontend
pnpm lint        # 检查代码
pnpm lint:fix    # 自动修复
pnpm typecheck   # 类型检查
```

### 后端代码规范

- 使用 Java 17 特性
- 遵循阿里巴巴 Java 开发规范
- 类名使用 PascalCase
- 方法名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

## Pull Request 流程

### 创建 PR

1. 确保代码通过所有检查
   - 代码 Lint 检查通过
   - 类型检查通过
   - 单元测试通过

2. 填写 PR 描述
   - 简要说明改动内容
   - 说明测试情况

### PR 模板

```markdown
## 改动说明

简要描述本次改动的内容

## 改动类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 代码重构
- [ ] 文档更新
- [ ] 其他

## 测试情况

- [ ] 本地测试通过
- [ ] 代码检查通过
- [ ] 类型检查通过

## 相关 Issue

关联 #issue_number（如有）
```

### 代码审查

- 审查者应关注：
  - 代码质量和可维护性
  - 是否符合项目规范
  - 是否有潜在问题
  - 是否需要补充测试

### 合并要求

- 所有检查通过
- 代码审查通过
- 无冲突
- 由项目维护者执行合并

## 开发建议

### 提交粒度

- 保持提交的原子性，一个提交只做一件事
- 避免将多个不相关的改动放在一个提交中
- 及时提交，避免积累过多改动

### 代码质量

- 编写清晰的代码，优先考虑可读性
- 添加必要的注释，特别是复杂逻辑
- 遵循项目的代码风格
- 编写单元测试

### 沟通协作

- 遇到问题及时沟通
- 重大改动前先讨论设计方案
- 及时响应代码审查的反馈
- 保持友好和专业的态度
