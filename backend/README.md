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

### AI 集成

- **Spring AI Alibaba 1.0.0-M5.1** - 阿里云通义千问 AI 服务
- **CommonMark 0.20.0** - Markdown 解析器
- **Spring WebFlux** - SSE 流式响应支持

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
│   │   │   │   ├── SleepController.java
│   │   │   │   ├── UploadController.java
│   │   │   │   ├── UserController.java
│   │   │   │   └── UserProfileController.java
│   │   │   ├── service/                      # 服务层
│   │   │   │   ├── BodyService.java
│   │   │   │   ├── DietService.java
│   │   │   │   ├── ExerService.java
│   │   │   │   └── SleepService.java
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
│   │   │   │   ├── Result.java              # 统一响应格式
│   │   │   │   └── PageBean.java            # 分页对象
│   │   │   ├── interceptor/                  # 拦截器
│   │   │   │   └── LoginCheckInterceptor.java
│   │   │   ├── config/                       # 配置类
│   │   │   │   ├── AiConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   └── utils/                        # 工具类
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
- MySQL 8.0+

### 安装依赖

```bash
./gradlew build -x test
```

### 环境变量配置

参照 `.env.example` 配置 `.env` 文件

在本地直接运行 `./gradlew bootRun`、`./gradlew test` 等命令前，先导入 `.env` 中的键值，让 Spring 进程可以拿到相关配置：

```bash
cd backend
export $(grep -v '^#' .env | xargs)
```

### 数据库初始化

```bash
# 方式 1：手动导入
mysql -u root -p < init.sql

# 方式 2：使用 Docker Compose
docker-compose up -d mysql
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

### 代码格式化

```bash
# 自动修复格式
./gradlew spotlessApply

# 仅检查格式
./gradlew spotlessCheck
```

### 构建部署

```bash
# 构建 JAR 包
./gradlew build

# 运行 JAR
java -jar build/libs/health-management-backend-0.0.1-SNAPSHOT.jar

# 指定环境
java -jar build/libs/health-management-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Docker 部署

### 单独构建后端镜像

```bash
# 构建镜像
docker build -t health-management-backend:latest .

# 运行容器（需要先启动 MySQL）
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/health_management_db \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  -e SPRING_AI_DASHSCOPE_API_KEY=your_api_key \
  -e JWT_SIGN_KEY=your_jwt_key \
  --name health-backend \
  health-management-backend:latest
```

> 镜像构建阶段会执行 `gradlew spotlessCheck`，若存在未格式化的 Java 文件，构建会直接失败

### 使用 Docker Compose

配置相关环境变量

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

### Docker Compose 服务说明

- **mysql**: MySQL 9.0 数据库
  - 端口：`3306`
  - 自动执行 `init.sql` 初始化脚本
  - 数据持久化到 `mysql_data` 卷
  - 健康检查：每 10 秒检查一次

- **backend**: Spring Boot 应用
  - 端口：`8080`
  - 依赖 MySQL 健康检查通过后启动
  - 头像存储持久化到 `avatar_data` 卷
  - 健康检查：通过 `/actuator/health` 端点

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

- 阿里云通义千问模型（`qwen-turbo`）
- SSE 流式响应
- Markdown 格式化
- 自动重试机制（最多 3 次）
- 超时配置（连接 60s，读写 120s）

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

- **用户认证**：`POST /auth/register`, `POST /auth/login`
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

## 环境变量说明（核心）

- `SPRING_DATASOURCE_URL`：数据库连接串，默认 `jdbc:mysql://localhost:3306/health_management_db`
- `SPRING_DATASOURCE_USERNAME`：数据库用户名，默认 `root`
- `SPRING_DATASOURCE_PASSWORD`：数据库密码（必填）
- `JWT_SIGN_KEY`：JWT 签名密钥（必填）
- `JWT_EXPIRE_TIME`：JWT 过期时间（毫秒），默认 `43200000`（12 小时）
- `SPRING_AI_DASHSCOPE_API_KEY`：通义千问 API Key（可选，仅启用 AI 时需要）
- `SERVER_PORT`：服务端口，默认 `8080`
- `AVATAR_UPLOAD_DIR`：头像上传目录，容器内默认 `/app/avatars`

## 常见问题（FAQ）

- Docker 拉取 MySQL 失败：如 `mysql:9.0` 不存在，建议将 `docker-compose.yml` 中镜像改为 `mysql:8.4` 或 `mysql:8.0`。
- 返回未登录：确认前端按文档将 Token 放在 `Authorization: Bearer <JWT>` 或 `token` 头、或 Cookie `token`。
- 启动报缺少密钥：确保设置了 `JWT_SIGN_KEY`，且与发放 Token 使用的密钥一致。
- AI 请求超时：检查 `SPRING_AI_DASHSCOPE_API_KEY`，并确认网络可访问 DashScope。

## 安全与依赖建议

- 优先使用 Spring Boot 自带 Jackson 做 JSON 序列化，避免引入 Fastjson 历史安全风险；如需使用，请锁定安全版本并限制使用面。
- 生产环境尽量避免使用里程碑/快照仓库依赖，优先选择稳定版。
