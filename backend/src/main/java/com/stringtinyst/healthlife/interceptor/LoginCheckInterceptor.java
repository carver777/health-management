package com.stringtinyst.healthlife.interceptor;

import com.alibaba.fastjson.JSONObject;
import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.utils.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Slf4j
@Component
public class LoginCheckInterceptor implements HandlerInterceptor {

  private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
  private static final String[] AUTH_WHITELIST = {
    "/actuator/**",
    "/error",
    "/auth/login",
    "/auth/register",
    "/api/auth/login",
    "/api/auth/register",
    "/auth/password/reset",
    "/api/auth/password/reset"
  };

  @Autowired private JwtUtils jwtUtils;

  @Override
  public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler)
      throws Exception {
    String url = req.getRequestURI().toString();

    if (isWhitelisted(url)) {
      return true;
    }

    // 支持三种格式：1. token header  2. Authorization: Bearer <token>  3. Cookie 中的 token
    String jwt = req.getHeader("token");
    if (!StringUtils.hasLength(jwt)) {
      String authorization = req.getHeader("Authorization");
      if (StringUtils.hasLength(authorization) && authorization.startsWith("Bearer ")) {
        jwt = authorization.substring(7); // 移除 "Bearer " 前缀
      }
    }

    // 如果 header 中没有 token，尝试从 Cookie 中获取
    if (!StringUtils.hasLength(jwt)) {
      Cookie[] cookies = req.getCookies();
      if (cookies != null) {
        for (Cookie cookie : cookies) {
          if ("token".equals(cookie.getName())) {
            jwt = cookie.getValue();
            break;
          }
        }
      }
    }

    if (!StringUtils.hasLength(jwt)) {
      log.warn("请求未携带 token (header/cookie): {}", url);
      Result error = Result.error("未登录或登录已过期，请重新登录");
      String notLogin = JSONObject.toJSONString(error);
      resp.setContentType("application/json;charset=UTF-8");
      resp.getWriter().write(notLogin);
      return false;
    }

    try {
      jwtUtils.parseJWT(jwt);
    } catch (Exception e) {
      log.error("Token 验证失败: {}", e.getMessage());
      Result error = Result.error("登录已过期，请重新登录");
      String notLogin = JSONObject.toJSONString(error);
      resp.setContentType("application/json;charset=UTF-8");
      resp.getWriter().write(notLogin);
      return false;
    }
    return true;
  }

  private boolean isWhitelisted(String url) {
    for (String pattern : AUTH_WHITELIST) {
      if (PATH_MATCHER.match(pattern, url)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public void postHandle(
      HttpServletRequest request,
      HttpServletResponse response,
      Object handler,
      ModelAndView modelAndView)
      throws Exception {}

  @Override
  public void afterCompletion(
      HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
      throws Exception {}
}
