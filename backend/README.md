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

- **Maven** - 项目构建管理
- **Lombok** - 简化 Java 代码
- **PageHelper 1.4.7** - MyBatis 分页插件
- **Spring Boot DevTools** - 开发热重载
- **Spring Boot Actuator** - 健康检查端点

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
│   │   │   │   ├── UploadController.java
│   │   │   │   ├── UserController.java
│   │   │   │   └── UserProfileController.java
│   │   │   ├── service/                      # 服务层
│   │   │   │   ├── BodyService.java
│   │   │   │   ├── DietService.java
│   │   │   │   └── ...
│   │   │   ├── mapper/                       # MyBatis 映射器
│   │   │   │   ├── BodyMapper.java
│   │   │   │   ├── DietMapper.java
│   │   │   │   ├── ExerMapper.java
│   │   │   │   └── UsersMapper.java
│   │   │   ├── pojo/                         # 实体类
│   │   │   │   ├── Body.java
│   │   │   │   ├── Diet.java
│   │   │   │   ├── Exer.java
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
├── pom.xml                                   # Maven 依赖配置
├── mvnw                                      # Maven Wrapper (Unix)
├── mvnw.cmd                                  # Maven Wrapper (Windows)
└── README.md
```

## 快速开始

### 环境要求

- Java 17+
- Maven 3.9+
- MySQL 8.0+

### 安装依赖

```bash
./mvnw clean install
```

### 环境变量配置

参考 `.env.example` 创建环境变量或直接修改 `application.properties`：

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/health_management_db
spring.datasource.username=root
spring.datasource.password=your_password

# AI 配置
spring.ai.dashscope.api-key=your_dashscope_api_key

# JWT 配置
jwt.sign-key=your_jwt_secret_key
jwt.expire-time=43200000
```

### 数据库初始化

```bash
# 方式 1：手动导入
mysql -u root -p < init.sql

# 方式 2：使用 Docker Compose（推荐）
docker-compose up -d mysql
```

### 开发环境启动

```bash
# 使用 Maven Wrapper
./mvnw spring-boot:run

# 或使用 IDE 运行 HealthLifeApplication.java
# API 运行在 http://localhost:8080
```

### 测试

```bash
# 运行所有测试
./mvnw test

# 跳过测试打包
./mvnw clean package -DskipTests
```

### 构建部署

```bash
# 构建 JAR 包
./mvnw clean package

# 运行 JAR
java -jar target/health-management-backend-0.0.1-SNAPSHOT.jar

# 指定环境
java -jar target/health-management-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
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

### 使用 Docker Compose（推荐）

```bash
# 创建 .env 文件配置环境变量
cat > .env << EOF
MYSQL_ROOT_PASSWORD=your_mysql_password
SPRING_PROFILES_ACTIVE=prod
SPRING_AI_DASHSCOPE_API_KEY=your_dashscope_api_key
JWT_SIGN_KEY=your_jwt_secret_key
JWT_EXPIRE_TIME=43200000
EOF

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

- **用户认证**：`POST /login`, `POST /register`
- **用户信息**：`GET /user/userInfo`, `PUT /user/update`, `PATCH /user/updatePwd`
- **身体数据**：`GET /body`, `POST /body`, `PUT /body`, `DELETE /body`
- **饮食管理**：`GET /diet`, `POST /diet`, `PUT /diet`, `DELETE /diet`
- **运动管理**：`GET /exer`, `POST /exer`, `PUT /exer`, `DELETE /exer`
- **AI 咨询**：`GET /chat` (SSE 流式响应)
- **文件上传**：`POST /upload`
