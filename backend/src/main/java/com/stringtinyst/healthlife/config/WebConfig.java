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

  private final LoginCheckInterceptor loginCheckInterceptor;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(loginCheckInterceptor)
        .addPathPatterns("/**")
        .excludePathPatterns("/actuator/**", "/auth/login", "/auth/register", "/error");
  }
}
