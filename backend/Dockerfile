FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY gradle.properties .

# Configure Aliyun Maven mirror for Gradle
RUN mkdir -p ~/.gradle && \
    echo "allprojects {" > ~/.gradle/init.gradle && \
    echo "    repositories {" >> ~/.gradle/init.gradle && \
    echo "        maven { url 'https://maven.aliyun.com/repository/public/' }" >> ~/.gradle/init.gradle && \
    echo "        maven { url 'https://maven.aliyun.com/repository/spring/' }" >> ~/.gradle/init.gradle && \
    echo "        maven { url 'https://maven.aliyun.com/repository/google/' }" >> ~/.gradle/init.gradle && \
    echo "        maven { url 'https://maven.aliyun.com/repository/gradle-plugin/' }" >> ~/.gradle/init.gradle && \
    echo "        mavenLocal()" >> ~/.gradle/init.gradle && \
    echo "        mavenCentral()" >> ~/.gradle/init.gradle && \
    echo "    }" >> ~/.gradle/init.gradle && \
    echo "}" >> ~/.gradle/init.gradle

RUN ./gradlew dependencies --no-daemon
COPY src ./src

# Run spotless check and build
RUN ./gradlew spotlessCheck --no-daemon
RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r spring && \
    useradd -r -g spring spring

COPY --from=builder /app/build/libs/*.jar app.jar
RUN mkdir -p /app/avatars && chown -R spring:spring /app

USER spring:spring
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}", \
    "-jar", \
    "app.jar"]
