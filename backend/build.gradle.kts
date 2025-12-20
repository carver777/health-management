import org.apache.tools.ant.taskdefs.condition.Os

plugins {
    java
    id("org.springframework.boot") version "3.4.6"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "7.0.3"
}

tasks.register<Exec>("installGitHooks") {
    group = "verification"
    description = "Installs git hooks using pre-commit"

    // Calculate absolute path to scripts directory
    // project.projectDir is '.../backend', so parent is project root
    val scriptsDir = project.projectDir.parentFile.resolve("scripts")

    // Set working directory to the project root
    workingDir(project.projectDir.parentFile)

    if (Os.isFamily(Os.FAMILY_WINDOWS)) {
        val scriptPath = scriptsDir.resolve("check-pre-commit.ps1").absolutePath
        commandLine("pwsh", "-ExecutionPolicy", "Bypass", "-File", scriptPath)
    } else {
        val scriptPath = scriptsDir.resolve("check-pre-commit.sh").absolutePath
        commandLine("bash", scriptPath)
    }
}

tasks.named("compileJava") {
    dependsOn("installGitHooks")
}

group = "com.stringtinyst"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
    maven {
        url = uri("https://repo.spring.io/milestone")
        mavenContent {
            snapshotsOnly()
        }
    }
}

dependencies {
    // Spring Boot Starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // MyBatis
    implementation("org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.4")

    // Database
    runtimeOnly("com.mysql:mysql-connector-j")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // PageHelper
    implementation("com.github.pagehelper:pagehelper-spring-boot-starter:1.4.7")

    // CSV
    implementation("org.apache.commons:commons-csv:1.10.0")

    // JWT
    implementation("io.jsonwebtoken:jjwt:0.9.1")
    implementation("javax.xml.bind:jaxb-api:2.3.1")

    // JSON
    implementation("com.alibaba:fastjson:1.2.83")

    // AI Integration
    implementation("org.springframework.ai:spring-ai-openai-spring-boot-starter:1.0.0-M5")

    // HTTP Client for web search
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Markdown Parser
    implementation("org.commonmark:commonmark:0.20.0")
    implementation("org.commonmark:commonmark-ext-gfm-tables:0.20.0")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.mybatis.spring.boot:mybatis-spring-boot-starter-test:3.0.4")
    testImplementation("com.h2database:h2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

spotless {
    java {
        googleJavaFormat("1.22.0")
        target("src/**/*.java")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    archiveFileName.set("${project.name}-${project.version}.jar")
}

tasks.withType<JavaCompile> {
    options.compilerArgs.addAll(listOf("-Xlint:unchecked", "-Xlint:deprecation"))
}
