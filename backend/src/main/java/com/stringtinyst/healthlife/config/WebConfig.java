package com.stringtinyst.healthlife.config;

import com.stringtinyst.healthlife.interceptor.LoginCheckInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Web MVC configuration Configures interceptors for authentication */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

  private static final String[] AUTH_WHITELIST = {
    "/actuator/**",
    "/error",
    "/auth/login",
    "/auth/register",
    "/auth/password/reset",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/password/reset"
  };

  private final LoginCheckInterceptor loginCheckInterceptor;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(loginCheckInterceptor)
        .addPathPatterns("/**")
        .excludePathPatterns(AUTH_WHITELIST);
  }
}
