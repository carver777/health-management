# 测试用例表

本文档列出了基于上述方法设计的核心测试用例，涵盖前端 E2E 测试、单元测试及后端接口测试。

## E2E 部分

| 用例ID | 测试模块 | 测试目的 | 测试步骤 | 实际结果 |
| :--- | :--- | :--- | :--- | :--- |
| **TC-E2E-BODY-001** | 身体 | 页面加载与统计卡片显示 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-002** | 身体 | 数据表格显示与分页 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-003** | 身体 | 筛选功能 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-004** | 身体 | 新增身体指标记录 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-005** | 身体 | 表单验证 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-006** | 身体 | 编辑身体指标记录 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-007** | 身体 | 删除身体指标记录 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-008** | 身体 | 导出功能 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-009** | 身体 | API 错误处理 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-BODY-010** | 身体 | 空数据状态 | 运行自动化测试脚本 (body-data.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-001** | AI助手 | 应该显示聊天界面基本元素 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-002** | AI助手 | 应该能够输入并发送消息，且接收到 AI 回复 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-003** | AI助手 | 点击快捷建议应该自动填充并发送 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-004** | AI助手 | Markdown 渲染测试 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-005** | AI助手 | 错误处理：API 失败 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-006** | AI助手 | 清除对话历史 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-007** | AI助手 | 聊天记录持久化 (LocalStorage) | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-CHAT-008** | AI助手 | 应该显示连接状态 | 运行自动化测试脚本 (chat.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-001** | 边界 | 数据导出功能验证 (CSV 格式与内容) | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-002** | 边界 | 列表空状态展示 (Empty State) | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-003** | 边界 | 网络错误与异常处理提示 | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-004** | 边界 | 表单非法输入验证反馈（负数） | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-005** | 边界 | 表单非法输入验证反馈（超大数值） | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-006** | 边界 | 会话过期自动跳转 (401 Handling) | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-BOUND-007** | 边界 | 特殊字符与 XSS 防护验证 | 运行自动化测试脚本 (common-boundary.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-001** | 仪表盘 | 应该显示健康数据概览卡片 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-002** | 仪表盘 | 应该显示正确的统计数据 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-003** | 仪表盘 | 应该渲染体重和卡路里图表 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-004** | 仪表盘 | 应该能够切换图表时间段 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-005** | 仪表盘 | 应该能够导航到各个功能页面 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-006** | 仪表盘 | 应该显示健康目标 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-007** | 仪表盘 | 应该处理API错误 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DASH-008** | 仪表盘 | 应该正确处理空数据 | 运行自动化测试脚本 (dashboard.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-001** | 饮食 | 应该显示饮食记录列表 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-002** | 饮食 | 应该正确显示今日统计数据 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-003** | 饮食 | 应该能够新增饮食记录 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-004** | 饮食 | 应该能够编辑饮食记录 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-005** | 饮食 | 应该能够删除饮食记录 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-006** | 饮食 | 应该能够筛选用餐类型 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-007** | 饮食 | 应该能够重置筛选条件 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-008** | 饮食 | 应该能够进行分页切换 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-009** | 饮食 | 应该能够导出数据 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-010** | 饮食 | 应该根据热量显示不同颜色标签 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-DIET-011** | 饮食 | 应该显示空状态 | 运行自动化测试脚本 (diet.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-001** | 运动 | 应该显示运动记录列表和统计卡片 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-002** | 运动 | 应该能够筛选运动记录 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-003** | 运动 | 应该能够导出运动记录 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-004** | 运动 | 应该能够新增运动记录并验证表单逻辑 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-005** | 运动 | 应该能够编辑运动记录 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-006** | 运动 | 应该能够删除运动记录 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-EXER-007** | 运动 | 应该处理删除失败的情况 | 运行自动化测试脚本 (exercise.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-001** | 首页 | 页面应该有正确的标题 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-002** | 首页 | 应该显示主标题 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-003** | 首页 | 应该显示描述文字 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-004** | 首页 | 应该显示登录和注册按钮 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-005** | 首页 | 应该显示核心功能列表 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-006** | 首页 | 点击登录按钮应该导航到登录页面 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-007** | 首页 | 点击注册按钮应该导航到注册页面 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-HOME-008** | 首页 | 应该显示页脚版权信息 | 运行自动化测试脚本 (home.spec.ts) | ✅ Pass |
| **TC-E2E-LAYOUT-001** | 布局 | 侧边栏导航跳转正确性 | 运行自动化测试脚本 (layout.spec.ts) | ✅ Pass |
| **TC-E2E-LAYOUT-002** | 布局 | 用户下拉菜单功能 | 运行自动化测试脚本 (layout.spec.ts) | ✅ Pass |
| **TC-E2E-LAYOUT-003** | 布局 | 退出登录功能 | 运行自动化测试脚本 (layout.spec.ts) | ✅ Pass |
| **TC-E2E-LAYOUT-004** | 布局 | AI助手悬浮按钮功能 | 运行自动化测试脚本 (layout.spec.ts) | ✅ Pass |
| **TC-E2E-LAYOUT-005** | 布局 | 移动端侧边栏响应式 | 运行自动化测试脚本 (layout.spec.ts) | ✅ Pass |
| **TC-E2E-LAYOUT-006** | 布局 | 登录页使用空白布局 | 运行自动化测试脚本 (layout.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-001** | 认证 | 应该显示登录表单 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-002** | 认证 | 应该能够输入邮箱和密码 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-003** | 认证 | 应该能够切换到注册表单 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-004** | 认证 | 点击注册按钮应该切换到注册表单 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-005** | 认证 | 通过 URL 参数访问应该直接显示注册表单 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-006** | 认证 | 应该能够从注册页面切换回登录页面 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-007** | 认证 | 点击忘记密码按钮应该显示重置表单 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-008** | 认证 | 密码重置表单应该能够填写并返回登录页 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-009** | 认证 | 应该显示所有注册字段 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-010** | 认证 | 应该能够选择性别 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-AUTH-011** | 认证 | 应该能够填写注册表单 | 运行自动化测试脚本 (login.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-001** | 个人资料 | 应该显示个人基本信息和健康统计 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-002** | 个人资料 | 应该能够上传头像 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-003** | 个人资料 | 应该能够编辑个人信息并进行验证 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-004** | 个人资料 | 应该能够修改密码并进行验证 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-005** | 个人资料 | 应该能够设置健康目标并进行验证 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-006** | 个人资料 | 退出登录流程 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-PROF-007** | 个人资料 | 加载失败时应该显示错误提示并允许重试 | 运行自动化测试脚本 (profile.spec.ts) | ✅ Pass |
| **TC-E2E-SLEEP-001** | 睡眠 | 应该显示睡眠记录列表和统计信息 | 运行自动化测试脚本 (sleep.spec.ts) | ✅ Pass |
| **TC-E2E-SLEEP-002** | 睡眠 | 应该能够新增睡眠记录 | 运行自动化测试脚本 (sleep.spec.ts) | ✅ Pass |
| **TC-E2E-SLEEP-003** | 睡眠 | 新增记录时应该验证时间顺序 | 运行自动化测试脚本 (sleep.spec.ts) | ✅ Pass |
| **TC-E2E-SLEEP-004** | 睡眠 | 应该能够编辑睡眠记录 | 运行自动化测试脚本 (sleep.spec.ts) | ✅ Pass |
| **TC-E2E-SLEEP-005** | 睡眠 | 应该能够删除睡眠记录 | 运行自动化测试脚本 (sleep.spec.ts) | ✅ Pass |
| **TC-E2E-SLEEP-006** | 睡眠 | 当没有数据时应该显示空状态 | 运行自动化测试脚本 (sleep.spec.ts) | ✅ Pass |

## API 部分

| 用例ID | 测试模块 | 接口/方法 | 测试目的 | 测试步骤 | 实际结果 |
| :--- | :--- | - | :--- | :--- | :--- |
| **TC-API-USER-001** | 用户接口 | POST /auth/login | 登录凭证有效时应返回 Token | 运行后端测试 (UserControllerTest.java) | ✅ Pass |
| **TC-API-USER-002** | 用户接口 | POST /auth/register | 用户已存在时注册应返回错误 | 运行后端测试 (UserControllerTest.java) | ✅ Pass |
| **TC-API-USER-003** | 用户接口 | POST /auth/password/reset | 重置密码应验证输入完整性 | 运行后端测试 (UserControllerTest.java) | ✅ Pass |
| **TC-API-USER-004** | 用户接口 | POST /auth/password/reset | 确认密码不匹配时重置密码应失败 | 运行后端测试 (UserControllerTest.java) | ✅ Pass |
| **TC-API-USER-005** | 用户接口 | POST /auth/password/reset | 昵称邮箱不匹配时重置密码应失败 | 运行后端测试 (UserControllerTest.java) | ✅ Pass |
| **TC-API-DIET-001** | 饮食接口 | GET /diet-items | 查询饮食列表应返回分页数据 | 运行后端测试 (DietControllerTest.java) | ✅ Pass |
| **TC-API-DIET-002** | 饮食接口 | POST /diet-items | 新增饮食记录应返回生成的 ID | 运行后端测试 (DietControllerTest.java) | ✅ Pass |
| **TC-API-EXER-001** | 运动接口 | GET /exercise-items | 查询运动列表应返回分页数据 | 运行后端测试 (ExerControllerTest.java) | ✅ Pass |
| **TC-API-EXER-002** | 运动接口 | POST /exercise-items | 新增运动记录应返回生成的 ID | 运行后端测试 (ExerControllerTest.java) | ✅ Pass |
| **TC-API-SLEEP-001** | 睡眠接口 | GET /sleep-items | 查询睡眠列表应返回分页数据 | 运行后端测试 (SleepControllerTest.java) | ✅ Pass |
| **TC-API-SLEEP-002** | 睡眠接口 | POST /sleep-items | 新增睡眠记录应返回生成的 ID | 运行后端测试 (SleepControllerTest.java) | ✅ Pass |
| **TC-SVC-USER-001** | 用户服务 | UserService.registerUser | 注册新用户时应对密码进行加密 | 运行后端测试 (UserServiceImplTest.java) | ✅ Pass |
| **TC-SVC-USER-002** | 用户服务 | UserService.registerUser | 邮箱已存在时注册应失败 | 运行后端测试 (UserServiceImplTest.java) | ✅ Pass |
| **TC-SVC-USER-003** | 用户服务 | UserService.loginUser | 用户不存在时登录应抛出异常 | 运行后端测试 (UserServiceImplTest.java) | ✅ Pass |
| **TC-SVC-USER-004** | 用户服务 | UserService.loginUser | 密码错误时登录应抛出异常 | 运行后端测试 (UserServiceImplTest.java) | ✅ Pass |
| **TC-SVC-USER-005** | 用户服务 | UserService.loginUser | 密码正确时登录应返回用户 ID | 运行后端测试 (UserServiceImplTest.java) | ✅ Pass |
| **TC-SVC-BODY-001** | 身体数据服务 | BodyService.page | 分页查询应正确封装 PageBean | 运行后端测试 (BodyServiceImplTest.java) | ✅ Pass |
| **TC-SVC-BODY-002** | 身体数据服务 | BodyService.addBody | 新增身体数据应调用 Mapper | 运行后端测试 (BodyServiceImplTest.java) | ✅ Pass |
| **TC-SVC-BODY-003** | 身体数据服务 | BodyService.deleteBody | 删除身体数据应调用 Mapper | 运行后端测试 (BodyServiceImplTest.java) | ✅ Pass |
| **TC-API-POSTMAN-001** | Auth / Register | POST /auth/register | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-002** | Auth / Register | POST /auth/register | Register success or already exists | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-003** | Auth / Login | POST /auth/login | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-004** | Auth / Login | POST /auth/login | Login succeeded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-005** | Auth / Login (Wrong Password) | POST /auth/login | Wrong password handled | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-006** | Auth / Login (Wrong Password) | POST /auth/login | Wrong password rejected | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-007** | Auth / Password Reset (New Password) | POST /auth/password/reset | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-008** | Auth / Password Reset (New Password) | POST /auth/password/reset | Password reset (new) succeeded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-009** | Auth / Login (Using Reset Password) | POST /auth/login | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-010** | Auth / Login (Using Reset Password) | POST /auth/login | Login with reset password succeeded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-011** | Auth / Password Reset (Restore Password) | POST /auth/password/reset | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-012** | Auth / Password Reset (Restore Password) | POST /auth/password/reset | Password reset (restore) succeeded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-013** | Auth / Login (After Restore) | POST /auth/login | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-014** | Auth / Login (After Restore) | POST /auth/login | Login after restore succeeded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-015** | User / Get Profile | GET /user/profile | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-016** | User / Get Profile | GET /user/profile | Profile loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-017** | User / Get Profile | GET /user/profile | Profile userId synchronized | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-018** | User / Update Profile | PUT /user/profile | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-019** | User / Update Profile | PUT /user/profile | Profile updated | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-020** | User / Update Profile | PUT /user/profile | Profile reflects latest changes | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-021** | User / Get User Detail | GET /user/{userID} | User id ready for detail | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-022** | User / Get User Detail | GET /user/{userID} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-023** | User / Get User Detail | GET /user/{userID} | User detail loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-024** | User / Update User Detail | PUT /user/{userID} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-025** | User / Update User Detail | PUT /user/{userID} | User detail updated | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-026** | User / Update User Detail | PUT /user/{userID} | User id ready for admin update | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-027** | User / Update User Detail | PUT /user/{userID} | Admin update reflected in user detail | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-028** | User / Upload Avatar | POST /user/avatar | Avatar upload request completed | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-029** | User / Upload Avatar | POST /user/avatar | Avatar upload succeeded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-030** | User / Upload Avatar | POST /user/avatar | Uploaded avatar can be fetched | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-031** | User / Upload Avatar | HEAD /user/avatar | Avatar HEAD probe succeeds | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-032** | User / Get Avatar | GET /user/avatar | Avatar response status | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-033** | User / Get Avatar | GET /user/avatar | Avatar stream available | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-034** | User / Head Avatar | HEAD /user/avatar | Avatar HEAD status | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-035** | Body Metrics / List Body Metrics | GET /body-metrics | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-036** | Body Metrics / List Body Metrics | GET /body-metrics | Body metric list loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-037** | Body Metrics / List Body Metrics | GET /body-metrics | Tracked Body metric appears in list | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-038** | Body Metrics / Create Body Metric | POST /body-metrics | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-039** | Body Metrics / Create Body Metric | POST /body-metrics | Body metric created | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-040** | Body Metrics / Create Body Metric | POST /body-metrics | Created Body metric persisted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-041** | Body Metrics / Get Body Metric Detail | GET /body-metrics/{id} | Body metric id ready for detail | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-042** | Body Metrics / Get Body Metric Detail | GET /body-metrics/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-043** | Body Metrics / Get Body Metric Detail | GET /body-metrics/{id} | Body metric detail loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-044** | Body Metrics / Create Body Metric (Invalid Weight) | POST /body-metrics | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-045** | Body Metrics / Create Body Metric (Invalid Weight) | POST /body-metrics | Invalid weight rejected | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-046** | Body Metrics / Update Body Metric | PUT /body-metrics/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-047** | Body Metrics / Update Body Metric | PUT /body-metrics/{id} | Body metric updated | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-048** | Body Metrics / Update Body Metric | PUT /body-metrics/{id} | Body metric id ready for update | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-049** | Body Metrics / Update Body Metric | PUT /body-metrics/{id} | Updated Body metric reflects new values | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-050** | Body Metrics / Delete Body Metric | DELETE /body-metrics/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-051** | Body Metrics / Delete Body Metric | DELETE /body-metrics/{id} | Body metric deleted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-052** | Body Metrics / Delete Body Metric | DELETE /body-metrics/{id} | Body metric id ready for delete | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-053** | Body Metrics / Delete Body Metric | DELETE /body-metrics/{id} | Deleted Body metric no longer retrievable | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-054** | Body Metrics / Export Body Metrics to CSV | GET /body-metrics/export | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-055** | Body Metrics / Export Body Metrics to CSV | GET /body-metrics/export | Content-Disposition header present | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-056** | Body Metrics / Export Body Metrics to CSV | GET /body-metrics/export | CSV content type | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-057** | Body Metrics / Export Body Metrics to CSV | GET /body-metrics/export | CSV content has headers | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-058** | Diet Records / List Diet Records | GET /diet-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-059** | Diet Records / List Diet Records | GET /diet-items | Diet record list loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-060** | Diet Records / List Diet Records | GET /diet-items | Tracked Diet record appears in list | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-061** | Diet Records / Create Diet Record | POST /diet-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-062** | Diet Records / Create Diet Record | POST /diet-items | Diet record created | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-063** | Diet Records / Create Diet Record | POST /diet-items | Created Diet record persisted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-064** | Diet Records / Get Diet Record Detail | GET /diet-items/{id} | Diet record id ready for detail | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-065** | Diet Records / Get Diet Record Detail | GET /diet-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-066** | Diet Records / Get Diet Record Detail | GET /diet-items/{id} | Diet record detail loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-067** | Diet Records / Update Diet Record | PUT /diet-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-068** | Diet Records / Update Diet Record | PUT /diet-items/{id} | Diet record updated | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-069** | Diet Records / Update Diet Record | PUT /diet-items/{id} | Diet record id ready for update | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-070** | Diet Records / Update Diet Record | PUT /diet-items/{id} | Updated Diet record reflects new values | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-071** | Diet Records / Delete Diet Record | DELETE /diet-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-072** | Diet Records / Delete Diet Record | DELETE /diet-items/{id} | Diet record deleted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-073** | Diet Records / Delete Diet Record | DELETE /diet-items/{id} | Diet record id ready for delete | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-074** | Diet Records / Delete Diet Record | DELETE /diet-items/{id} | Deleted Diet record no longer retrievable | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-075** | Diet Records / Export Diet Records to CSV | GET /diet-items/export | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-076** | Diet Records / Export Diet Records to CSV | GET /diet-items/export | Content-Disposition header present | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-077** | Diet Records / Export Diet Records to CSV | GET /diet-items/export | CSV content type | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-078** | Diet Records / Export Diet Records to CSV | GET /diet-items/export | CSV content has headers | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-079** | Exercise Records / List Exercise Records | GET /exercise-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-080** | Exercise Records / List Exercise Records | GET /exercise-items | Exercise record list loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-081** | Exercise Records / List Exercise Records | GET /exercise-items | Tracked Exercise record appears in list | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-082** | Exercise Records / Create Exercise Record | POST /exercise-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-083** | Exercise Records / Create Exercise Record | POST /exercise-items | Exercise record created | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-084** | Exercise Records / Create Exercise Record | POST /exercise-items | Created Exercise record persisted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-085** | Exercise Records / Get Exercise Record Detail | GET /exercise-items/{id} | Exercise record id ready for detail | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-086** | Exercise Records / Get Exercise Record Detail | GET /exercise-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-087** | Exercise Records / Get Exercise Record Detail | GET /exercise-items/{id} | Exercise record detail loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-088** | Exercise Records / Update Exercise Record | PUT /exercise-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-089** | Exercise Records / Update Exercise Record | PUT /exercise-items/{id} | Exercise record updated | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-090** | Exercise Records / Update Exercise Record | PUT /exercise-items/{id} | Exercise record id ready for update | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-091** | Exercise Records / Update Exercise Record | PUT /exercise-items/{id} | Updated Exercise record reflects new values | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-092** | Exercise Records / Delete Exercise Record | DELETE /exercise-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-093** | Exercise Records / Delete Exercise Record | DELETE /exercise-items/{id} | Exercise record deleted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-094** | Exercise Records / Delete Exercise Record | DELETE /exercise-items/{id} | Exercise record id ready for delete | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-095** | Exercise Records / Delete Exercise Record | DELETE /exercise-items/{id} | Deleted Exercise record no longer retrievable | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-096** | Exercise Records / Export Exercise Records to CSV | GET /exercise-items/export | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-097** | Exercise Records / Export Exercise Records to CSV | GET /exercise-items/export | Content-Disposition header present | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-098** | Exercise Records / Export Exercise Records to CSV | GET /exercise-items/export | CSV content type | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-099** | Exercise Records / Export Exercise Records to CSV | GET /exercise-items/export | CSV content has headers | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-100** | Sleep Records / List Sleep Records | GET /sleep-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-101** | Sleep Records / List Sleep Records | GET /sleep-items | Sleep record list loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-102** | Sleep Records / List Sleep Records | GET /sleep-items | Tracked Sleep record appears in list | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-103** | Sleep Records / Create Sleep Record | POST /sleep-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-104** | Sleep Records / Create Sleep Record | POST /sleep-items | Sleep record created | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-105** | Sleep Records / Create Sleep Record | POST /sleep-items | Created Sleep record persisted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-106** | Sleep Records / Get Sleep Record Detail | GET /sleep-items/{id} | Sleep record id ready for detail | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-107** | Sleep Records / Get Sleep Record Detail | GET /sleep-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-108** | Sleep Records / Get Sleep Record Detail | GET /sleep-items/{id} | Sleep record detail loaded | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-109** | Sleep Records / Create Sleep Record (Invalid Order) | POST /sleep-items | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-110** | Sleep Records / Create Sleep Record (Invalid Order) | POST /sleep-items | Invalid sleep order rejected | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-111** | Sleep Records / Update Sleep Record | PUT /sleep-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-112** | Sleep Records / Update Sleep Record | PUT /sleep-items/{id} | Sleep record updated | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-113** | Sleep Records / Update Sleep Record | PUT /sleep-items/{id} | Sleep record id ready for update | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-114** | Sleep Records / Update Sleep Record | PUT /sleep-items/{id} | Updated Sleep record reflects new values | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-115** | Sleep Records / Delete Sleep Record | DELETE /sleep-items/{id} | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-116** | Sleep Records / Delete Sleep Record | DELETE /sleep-items/{id} | Sleep record deleted | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-117** | Sleep Records / Delete Sleep Record | DELETE /sleep-items/{id} | Sleep record id ready for delete | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-118** | Sleep Records / Delete Sleep Record | DELETE /sleep-items/{id} | Deleted Sleep record no longer retrievable | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-119** | Sleep Records / Export Sleep Records to CSV | GET /sleep-items/export | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-120** | Sleep Records / Export Sleep Records to CSV | GET /sleep-items/export | Content-Disposition header present | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-121** | Sleep Records / Export Sleep Records to CSV | GET /sleep-items/export | CSV content type | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-122** | Sleep Records / Export Sleep Records to CSV | GET /sleep-items/export | CSV content has headers | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-123** | Chat / Delete Chat Memory | DELETE /chat/memory | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-124** | Chat / Delete Chat Memory | DELETE /chat/memory | Chat memory cleared | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-125** | Chat / Chat Stream (SSE) | POST /chat/stream | HTTP status is 200 | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-126** | Chat / Chat Stream (SSE) | POST /chat/stream | SSE content type | 运行 Postman 集合测试 | ✅ Pass |
| **TC-API-POSTMAN-127** | Chat / Chat Stream (SSE) | POST /chat/stream | SSE payload emitted data event | 运行 Postman 集合测试 | ✅ Pass |

## 单元测试部分

|用例ID|测试模块|测试目的|测试步骤|函数/组件 (参数)|实际结果|
|:---|:---|:---|:---| :--- |:---|
|**TC-UNIT-DASH-001**|仪表盘|应该是一个有效的客户端组件|运行自动化测试脚本 (CaloriesChart.spec.ts)|Component Props: data, date, intake, burn, net|✅ Pass|
|**TC-UNIT-DASH-002**|仪表盘|应该渲染时间周期按钮|运行自动化测试脚本 (CaloriesChart.spec.ts)|Component Props: data, date, intake, burn, net|✅ Pass|
|**TC-UNIT-DASH-003**|仪表盘|应该在无数据时显示空状态提示|运行自动化测试脚本 (CaloriesChart.spec.ts)|Component Props: data, date, intake, burn, net|✅ Pass|
|**TC-UNIT-DASH-004**|仪表盘|应该在有数据时渲染图表|运行自动化测试脚本 (CaloriesChart.spec.ts)|Component Props: data, date, intake, burn, net|✅ Pass|
|**TC-UNIT-DASH-005**|仪表盘|应该在点击时间周期按钮时触发 update:timePeriod 事件|运行自动化测试脚本 (CaloriesChart.spec.ts)|Component Props: data, date, intake, burn, net|✅ Pass|
|**TC-UNIT-DASH-006**|仪表盘|应该正确计算平均摄入量|运行自动化测试脚本 (CaloriesChart.spec.ts)|Component Props: data, date, intake, burn, net|✅ Pass|
|**TC-UNIT-COMP-001**|组件|应该正确渲染组件|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-002**|组件|没有传入值时应该显示今天的日期|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-003**|组件|传入 null 时应该显示今天的日期（组件默认行为）|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-004**|组件|应该接受 modelValue|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-005**|组件|应该支持不同的 size|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-006**|组件|应该支持 block 属性|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-007**|组件|点击按钮应该可以触发|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-008**|组件|应该发出 update:modelValue 事件|运行自动化测试脚本 (DatePicker.spec.ts)|Component Props: modelValue, minValue, maxValue, placeholder, block, size, id, name|✅ Pass|
|**TC-UNIT-COMP-009**|组件|应该正确渲染组件（关闭状态）|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-010**|组件|打开时应该显示对话框标题|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-011**|组件|应该在新增模式下显示正确的按钮文本|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-012**|组件|应该在编辑模式下显示正确的按钮文本|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-013**|组件|应该接受 open 属性|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-014**|组件|应该接受 editItem 属性（编辑模式）|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-015**|组件|应该能发出 update:open 事件|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-016**|组件|应该验证身高范围|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-017**|组件|应该验证体重范围|运行自动化测试脚本 (QuickBodyDataDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-018**|组件|应该正确渲染组件（关闭状态）|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-019**|组件|打开时应该显示对话框|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-020**|组件|应该在新增模式下显示正确的按钮文本|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-021**|组件|应该在编辑模式下显示正确的按钮文本|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-022**|组件|应该接受 open 属性|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-023**|组件|应该接受 editItem 属性|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-024**|组件|应该能发出 update:open 事件|运行自动化测试脚本 (QuickDietDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-025**|组件|应该正确渲染组件（关闭状态）|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-026**|组件|打开时应该显示对话框|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-027**|组件|应该在新增模式下显示正确的按钮文本|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-028**|组件|应该在编辑模式下显示正确的按钮文本|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-029**|组件|应该接受 open 属性|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-030**|组件|应该接受 editItem 属性|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-031**|组件|应该能发出 update:open 事件|运行自动化测试脚本 (QuickExerciseDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-032**|组件|应该正确渲染组件（关闭状态）|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-033**|组件|打开时应该显示对话框|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-034**|组件|应该在新增模式下显示正确的按钮文本|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-035**|组件|应该在编辑模式下显示正确的按钮文本|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-036**|组件|应该接受 open 属性|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-037**|组件|应该接受 editItem 属性|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-COMP-038**|组件|应该能发出 update:open 事件|运行自动化测试脚本 (QuickSleepDialog.spec.ts)|Component Props: open, editItem|✅ Pass|
|**TC-UNIT-DASH-007**|仪表盘|应该是一个有效的客户端组件|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-DASH-008**|仪表盘|应该渲染时间周期按钮|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-DASH-009**|仪表盘|应该在无数据时显示空状态提示|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-DASH-010**|仪表盘|应该在有数据时渲染图表|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-DASH-011**|仪表盘|应该在点击时间周期按钮时触发 update:timePeriod 事件|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-DASH-012**|仪表盘|应该正确计算平均体重|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-DASH-013**|仪表盘|应该在无数据时返回 0 作为平均值|运行自动化测试脚本 (WeightChart.spec.ts)|Component Props: data, date, weight|✅ Pass|
|**TC-UNIT-COMP-039**|组件|应该正确渲染组件|运行自动化测试脚本 (YearMonthSelect.spec.ts)|Component|✅ Pass|
|**TC-UNIT-COMP-040**|组件|应该渲染 slot 内容|运行自动化测试脚本 (YearMonthSelect.spec.ts)|Component|✅ Pass|
|**TC-UNIT-COMP-041**|组件|应该接受 placeholder|运行自动化测试脚本 (YearMonthSelect.spec.ts)|Component|✅ Pass|
|**TC-UNIT-COMP-042**|组件|应该接受 minValue 和 maxValue|运行自动化测试脚本 (YearMonthSelect.spec.ts)|Component|✅ Pass|
|**TC-UNIT-COMP-043**|组件|点击按钮应该可以触发|运行自动化测试脚本 (YearMonthSelect.spec.ts)|Component|✅ Pass|
|**TC-UNIT-AUTH-001**|认证|应该有默认的初始状态|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-002**|认证|登录成功时应该设置 token 并返回 true|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-003**|认证|登录失败时应该返回 false 并显示错误提示|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-004**|认证|注册成功时应该返回 true|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-005**|认证|注册失败时应该返回 false|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-006**|认证|重置密码成功时应该返回 true|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-007**|认证|重置密码失败时应该返回 false|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-008**|认证|更新成功时应该返回 true|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-009**|认证|更新失败时应该返回 false|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-010**|认证|获取用户信息成功|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-011**|认证|401 错误时应该退出登录|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-012**|认证|静默模式下 401 不应显示提示|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-013**|认证|退出登录时应该清除状态|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-014**|认证|静默退出时不应该显示提示|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-AUTH-015**|认证|非静默退出时应该显示提示|运行自动化测试脚本 (useAuth.spec.ts)|useAuth()|✅ Pass|
|**TC-UNIT-PROF-001**|个人资料|成功请求时应该缓存结果|运行自动化测试脚本 (useAvatar.spec.ts)|useAvatar()|✅ Pass|
|**TC-UNIT-PROF-002**|个人资料|请求返回 404 时应该返回 false 并缓存状态|运行自动化测试脚本 (useAvatar.spec.ts)|useAvatar()|✅ Pass|
|**TC-UNIT-PROF-003**|个人资料|请求异常时应该返回 false|运行自动化测试脚本 (useAvatar.spec.ts)|useAvatar()|✅ Pass|
|**TC-UNIT-PROF-004**|个人资料|头像存在时应该返回带时间戳的 URL|运行自动化测试脚本 (useAvatar.spec.ts)|getAvatarUrl()|✅ Pass|
|**TC-UNIT-PROF-005**|个人资料|重置后应该返回空字符串|运行自动化测试脚本 (useAvatar.spec.ts)|useAvatar()|✅ Pass|
|**TC-UNIT-CHART-001**|图表|应该返回 echarts 实例和方法|运行自动化测试脚本 (useECharts.spec.ts)|useECharts()|✅ Pass|
|**TC-UNIT-CHART-002**|图表|多次调用应该返回相同的方法|运行自动化测试脚本 (useECharts.spec.ts)|useECharts()|✅ Pass|
|**TC-UNIT-CHART-003**|图表|应该初始化图表实例|运行自动化测试脚本 (useECharts.spec.ts)|useECharts()|✅ Pass|
|**TC-UNIT-CHART-004**|图表|应该销毁图表实例|运行自动化测试脚本 (useECharts.spec.ts)|useECharts()|✅ Pass|
|**TC-UNIT-CHART-005**|图表|chart 为 null 时不应该报错|运行自动化测试脚本 (useECharts.spec.ts)|initChart(container: HTMLElement)|✅ Pass|
|**TC-UNIT-EXPORT-001**|导出|应该在未登录时显示错误提示|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-002**|导出|应该在没有 token 时显示错误提示|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-003**|导出|应该使用正确的参数调用导出接口|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-004**|导出|应该在导出成功时下载文件并显示成功提示|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-005**|导出|应该在包含日期范围时正确构建查询参数|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-006**|导出|应该在包含额外参数时正确构建查询参数|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-007**|导出|应该同时处理日期范围和额外参数|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-008**|导出|应该在请求失败时显示错误提示|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-009**|导出|应该在网络错误时显示错误提示|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-010**|导出|应该处理没有日期范围的情况|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-011**|导出|应该处理日期范围只有部分数据的情况|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-EXPORT-012**|导出|应该处理空的额外参数对象|运行自动化测试脚本 (useExport.spec.ts)|useExport()|✅ Pass|
|**TC-UNIT-NET-001**|网络|应该初始化为 disconnected 状态|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-002**|网络|应该在开始请求时更新为 connecting 状态|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-003**|网络|应该在连接成功后更新为 connected 状态|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-004**|网络|应该实现指数退避重试|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-005**|网络|应该在达到最大重试次数后失败|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-006**|网络|应该处理用户主动取消|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-007**|网络|应该在状态变化时调用回调|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-008**|网络|应该正确计算指数退避延迟|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-NET-009**|网络|应该允许重置重试计数|运行自动化测试脚本 (useSSEConnection.spec.ts)|useSSEConnection(options: UseSSEConnectionOptions = {})|✅ Pass|
|**TC-UNIT-UTIL-001**|工具|应该将 DateValue 转换为 YYYY-MM-DD 格式字符串|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-002**|工具|应该正确补零|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-003**|工具|应该将字符串转换为 DateValue|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-004**|工具|应该格式化 DateValue 为中文日期|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-005**|工具|应该格式化字符串日期|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-006**|工具|应该格式化日期时间为 HH:MM 格式|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-007**|工具|应该处理空值|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-008**|工具|应该格式化分钟为小时+分钟|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-009**|工具|应该处理 0 值|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-010**|工具|应该返回指定天数的日期范围|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-011**|工具|应该从时间段字符串提取天数|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-012**|工具|应该计算两个时间之间的分钟数|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-013**|工具|应该处理无效时间|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-014**|工具|结束时间早于开始时间应返回 0|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-015**|工具|应该返回今日的 DateValue|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-016**|工具|应该将 CalendarDateTime 转换为 ISO 字符串|运行自动化测试脚本 (dateUtils.spec.ts)|calendarDateTimeToISOString(dt: CalendarDateTime |✅ Pass|
|**TC-UNIT-UTIL-017**|工具|处理 null 应返回 null|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-018**|工具|应该正确补零|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-019**|工具|应该解析 ISO 字符串为 CalendarDateTime|运行自动化测试脚本 (dateUtils.spec.ts)|calendarDateTimeToISOString(dt: CalendarDateTime |✅ Pass|
|**TC-UNIT-UTIL-020**|工具|处理 null 或 undefined 应返回 null|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-021**|工具|处理无效格式应返回 null|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-022**|工具|处理构造异常时应返回 null|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-023**|工具|应该返回今天的 DateValue|运行自动化测试脚本 (dateUtils.spec.ts)|getTodayDateValue()|✅ Pass|
|**TC-UNIT-UTIL-024**|工具|应该正确计算 BMI|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-025**|工具|体重或身高为空时应返回 null|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-026**|工具|身高为 0 时应返回 null|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-027**|工具|应该处理边界值|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-028**|工具|应该返回格式化的 BMI 字符串|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-029**|工具|无法计算时应返回 "--"|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-030**|工具|BMI 为 null 时应返回未知状态|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-031**|工具|BMI < 18.5 应返回偏瘦|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-032**|工具|BMI 18.5-24 应返回正常|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-033**|工具|BMI 24-28 应返回偏胖|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-034**|工具|BMI >= 28 应返回肥胖|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-035**|工具|应该处理边界值 18.5|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-036**|工具|应该处理边界值 24|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-UTIL-037**|工具|应该处理边界值 28|运行自动化测试脚本 (metricUtils.spec.ts)|calcBMI(item: Pick<BodyData, 'weightKG' |✅ Pass|
|**TC-UNIT-NET-010**|网络|应该能处理连续的 JSON 对象流|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-011**|网络|应该在请求失败时抛出错误|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-012**|网络|应该在响应体为空时抛出错误|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-013**|网络|应该使用 POST 方法发送请求|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-014**|网络|应该设置 Content-Type 请求头|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-015**|网络|应该处理连续的 JSON 对象流|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-016**|网络|应该处理包含空格的数据流|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-017**|网络|应该处理包含转义字符的 JSON|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-018**|网络|应该处理不完整的 JSON 数据|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-019**|网络|应该跳过无效的 JSON 对象|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
|**TC-UNIT-NET-020**|网络|应该处理包含换行的 JSON 流|运行自动化测试脚本 (sse.spec.ts)|ssePost(path: string, options: SSEPostOptions)|✅ Pass|
