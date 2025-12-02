# 后端开发指南

## 技术栈

### 核心框架

- **Java 17**
- **Spring Boot 3.4.6**
- **Spring Web** - RESTful API 开发
- **MyBatis 3.0.4** - SQL 映射框架

### 数据库

- **MySQL 9.0** - 关系型数据库

### 认证与安全

- **JWT (JJWT 0.9.1)** - JSON Web Token 身份认证
- **自定义拦截器** - 请求认证与授权
- **密码重置** - `POST /auth/password/reset` 验证昵称与邮箱匹配即可重置密码

### AI 集成

- **Spring AI OpenAI 1.0.0-M5** - OpenAI 兼容接口
- **CommonMark 0.20.0** - Markdown 解析器
- **Spring WebFlux** - SSE 流式响应支持
- **OkHttp 4.12.0** - 联网搜索 HTTP 客户端
- **Spring AI Function Calling** - `BodyFunctions`、`SleepFunctions`、`DietFunctions`、`ExerciseFunctions`、`WebSearchFunction` 用于模型自动操作数据库和联网搜索
- **动态系统提示** - `AiPromptTemplate` 每次请求实时注入服务器日期与时间，指导模型统一使用服务端日期
- **FunctionResultCache** - 轻量缓存函数结果，避免模型在同一轮对话中重复触发查询

### 开发工具

- **Gradle 8.12** - 项目构建管理
- **Lombok** - 简化 Java 代码
- **PageHelper 1.4.7** - MyBatis 分页插件
- **Spring Boot DevTools** - 开发热重载
- **Spring Boot Actuator** - 健康检查端点
- **Spotless 7.0.3** - 代码格式化工具

## 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/stringtinyst/healthlife/
│   │   │   ├── HealthLifeApplication.java    # 主应用入口
│   │   │   ├── controller/                   # 控制器层
│   │   │   │   ├── BodyController.java
│   │   │   │   ├── ChatController.java
│   │   │   │   ├── DietController.java
│   │   │   │   ├── ExerController.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── SleepController.java
│   │   │   │   ├── UploadController.java
│   │   │   │   ├── UserController.java
│   │   │   │   └── UserProfileController.java
│   │   │   ├── service/                      # 服务层
│   │   │   │   ├── BodyService.java
│   │   │   │   ├── DietService.java
│   │   │   │   ├── ExerService.java
│   │   │   │   ├── SleepService.java
│   │   │   │   ├── UserService.java
│   │   │   │   └── impl/
│   │   │   │       ├── BodyServiceImpl.java
│   │   │   │       ├── DietServiceImpl.java
│   │   │   │       ├── ExerServiceImpl.java
│   │   │   │       ├── SleepServiceImpl.java
│   │   │   │       └── UserServiceImpl.java
│   │   │   ├── mapper/                       # MyBatis 映射器
│   │   │   │   ├── BodyMapper.java
│   │   │   │   ├── DietMapper.java
│   │   │   │   ├── ExerMapper.java
│   │   │   │   ├── SleepMapper.java
│   │   │   │   └── UsersMapper.java
│   │   │   ├── pojo/                         # 实体类
│   │   │   │   ├── Body.java
│   │   │   │   ├── Diet.java
│   │   │   │   ├── Exer.java
│   │   │   │   ├── Sleep.java
│   │   │   │   ├── User.java
│   │   │   │   ├── PasswordResetRequest.java # 密码重置请求体
│   │   │   │   ├── Result.java               # 统一响应格式
│   │   │   │   └── PageBean.java             # 分页对象
│   │   │   ├── interceptor/                  # 拦截器
│   │   │   │   └── LoginCheckInterceptor.java
│   │   │   ├── config/                       # 配置类
│   │   │   │   ├── AiConfig.java
│   │   │   │   ├── AiPromptTemplate.java
│   │   │   │   └── WebConfig.java
│   │   │   ├── function/                     # Spring AI Function 定义
│   │   │   │   ├── BaseHealthFunctionModule.java
│   │   │   │   ├── BodyFunctions.java
│   │   │   │   ├── DietFunctions.java
│   │   │   │   ├── ExerciseFunctions.java
│   │   │   │   ├── SleepFunctions.java
│   │   │   │   └── WebSearchFunction.java
│   │   │   └── utils/                        # 工具类
│   │   │       ├── FunctionResultCache.java  # AI 函数结果缓存
│   │   │       ├── JwtUtils.java             # JWT 解析/生成
│   │   │       ├── PasswordEncoder.java      # 密码加密工具
│   │   │       └── UserChatSessionManager.java
│   │   └── resources/
│   │       ├── application.properties        # 开发环境配置
│   │       ├── application-prod.properties   # 生产环境配置
│   │       └── com/stringtinyst/healthlife/
│   │           └── mapper/                   # MyBatis XML 映射文件
│   └── test/                                 # 测试代码
├── docker-compose.yml                        # Docker Compose 编排
├── Dockerfile                                # Docker 镜像构建
├── init.sql                                  # 数据库初始化脚本
├── build.gradle.kts                          # Gradle 构建配置
├── settings.gradle.kts                       # Gradle 设置文件
├── gradle.properties                         # Gradle 属性配置
├── gradlew                                   # Gradle Wrapper (Unix)
├── gradlew.bat                               # Gradle Wrapper (Windows)
└── README.md
```

## 快速开始

### 环境要求

- Java 17+
- Gradle 8.12+
- MySQL 9.0+

### 环境变量配置

参照 `.env.example` 配置 `.env` 文件

在本地直接运行 `./gradlew bootRun`、`./gradlew test` 等命令前，先导入 `.env` 中的键值，让 Spring 进程可以拿到相关配置：

```bash
cd backend
export $(grep -v '^#' .env | xargs)
```

### 开发环境启动

```bash
# 使用 Gradle Wrapper
./gradlew bootRun

# 或使用 IDE 运行 HealthLifeApplication.java
# API 运行在 http://localhost:8080
```

### 测试

```bash
# 运行所有测试
./gradlew test

# 跳过测试打包
./gradlew build -x test
```

> 测试说明
>
> - `test` Profile 会自动加载 `src/test/resources/application-test.properties`，使用 **H2** 内存数据库与 `schema.sql`、`data.sql`，CI 与本地无需依赖外部 MySQL
> - MyBatis 切片测试（`@MybatisTest`）直接校验 Mapper SQL，Service 与拦截器/Controller 则通过 Mockito、`@WebMvcTest` 做行为验证
> - AI、外呼等远程能力在测试 Profile 下默认关闭

### 代码格式化

```bash
# 自动修复格式
./gradlew spotlessApply

# 仅检查格式
./gradlew spotlessCheck
```

### 构建部署

```bash
# 构建生产用 JAR（本地执行）
./gradlew clean bootJar

# 本地验证（默认走 application-prod 配置）
java -jar build/libs/health-management-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

> 生产环境只需把 `./build/libs/` 下的 jar 文件与部署所需的 `Dockerfile`、`docker-compose.yml`、`.env` 拷贝到服务器即可

## Docker 部署

### 单独构建后端镜像

> 先在本地执行 `./gradlew clean bootJar`，确保 `./build/libs/health-management-backend-*.jar` 已生成，再继续以下步骤

```bash
# 构建镜像
docker build -t health-management-backend:latest .

# 使用 docker compose
docker compose up -d --build
```

## 架构特性

### 分层架构

- **Controller 层**：处理 HTTP 请求，参数验证
- **Service 层**：业务逻辑处理
- **Mapper 层**：MyBatis 数据访问
- **Pojo 层**：实体类与数据对象

### 统一响应格式

```java
{
  "code": 1,           // 1: 成功, 0: 失败
  "msg": "success",
  "data": {...}
}
```

### 认证机制

- JWT Token 认证
- 自定义登录拦截器
- Token 自动续期
- 白名单路径配置

支持三种 Token 传递方式（由 `LoginCheckInterceptor` 识别）：

- 请求头 `token: <JWT>`
- 请求头 `Authorization: Bearer <JWT>`
- Cookie `token=<JWT>`

### MyBatis 配置

- 驼峰命名自动映射（`map-underscore-to-camel-case`）
- PageHelper 分页插件
- XML 与注解混合使用

### AI 集成

- DeepSeek 思考模型（`deepseek-reasoner`）
- SSE 流式响应
- Markdown 格式化
- 自动重试机制（最多 3 次）
- 流式超时限制：若 60 秒未收到模型输出将返回“AI 服务响应超时”提示
- 内置函数：健康数据 CRUD（Body/Sleep/Diet/Exercise）与联网搜索 `webSearch`
- 系统提示自动注入服务器日期与时间，模型默认以当天日期落库，无需额外函数
- `FunctionResultCache` 避免模型在同一次对话中重复查询数据库或外部接口

SSE 流式接口调试示例：

```bash
curl -N \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"query":"你好"}' \
  http://localhost:8080/chat/stream
```

## API 规范

### 统一响应格式

```json
{
  "code": 1,
  "msg": "success",
  "data": {...}
}
```

### 状态码

- `1` - 请求成功
- `0` - 请求失败

### 认证

需要认证的接口在请求头携带 Token：

```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 核心接口

- **用户认证**：`POST /auth/register`, `POST /auth/login`, `POST /auth/password/reset`
- **用户信息**：`GET /user/profile`, `PUT /user/profile`, `GET /user/{userID}`, `PUT /user/{userID}`
- **文件上传**：`POST /user/avatar`，`GET /user/avatar`
- **身体数据（Body Metrics）**：
  - `GET /body-metrics`
  - `GET /body-metrics/{bodyMetricID}`
  - `POST /body-metrics`
  - `PUT /body-metrics/{bodyMetricID}`
  - `DELETE /body-metrics/{bodyMetricID}`
- **饮食管理（Diet Items）**：
  - `GET /diet-items`
  - `GET /diet-items/{dietItemID}`
  - `POST /diet-items`
  - `PUT /diet-items/{dietItemID}`
  - `DELETE /diet-items/{dietItemID}`
- **运动管理（Exercise Items）**：
  - `GET /exercise-items`
  - `GET /exercise-items/{exerciseItemID}`
  - `POST /exercise-items`
  - `PUT /exercise-items/{exerciseItemID}`
  - `DELETE /exercise-items/{exerciseItemID}`
- **睡眠管理（Sleep Items）**：
  - `GET /sleep-items`
  - `GET /sleep-items/{sleepItemID}`
  - `POST /sleep-items`
  - `PUT /sleep-items/{sleepItemID}`
  - `DELETE /sleep-items/{sleepItemID}`
- **AI 咨询**：`GET /chat?msg=...`（普通文本流）
- **AI 流式（SSE）**：`POST /chat/stream`（`text/event-stream`）

更多接口详情见项目根目录 `docs/api/overview.md` 及各模块 API 文档。

## 环境变量说明

- `SPRING_DATASOURCE_URL`：数据库连接串，默认 `jdbc:mysql://localhost:3306/health_management_db`
- `SPRING_DATASOURCE_USERNAME`：数据库用户名，默认 `root`
- `SPRING_DATASOURCE_PASSWORD`：数据库密码（必填）
- `JWT_SIGN_KEY`：JWT 签名密钥（必填）
- `JWT_EXPIRE_TIME`：JWT 过期时间（毫秒），默认 `43200000`（12 小时）
- `DEEPSEEK_API_KEY`：DeepSeek API Key
- `WEB_SEARCH_ENABLED` / `web.search.enabled`：是否允许模型调用联网搜索，默认 `true`
- `SERVER_PORT`：服务端口，默认 `8080`
- `AVATAR_UPLOAD_DIR`：头像上传目录，容器内默认 `/app/avatars`
