package com.stringtinyst.healthlife.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;

@Component
public class JwtUtils {

    @Value("${jwt.sign-key:stringtiny}")
    private String signKey;

    @Value("${jwt.expire-time:43200000}")
    private Long expire;

    /**
     * 生成 JWT 令牌
     * @param claims JWT 第二部分负载 payload 中存储的内容
     * @return
     */
    public String generateJwt(Map<String, Object> claims){
        String jwt = Jwts.builder()
                .addClaims(claims)
                .signWith(SignatureAlgorithm.HS256, signKey)
                .setExpiration(new Date(System.currentTimeMillis() + expire))
                .compact();
        return jwt;
    }

    /**
     * 解析 JWT 令牌
     * @param jwt JWT 令牌
     * @return JWT 第二部分负载 payload 中存储的内容
     */
    public Claims parseJWT(String jwt){
        if (jwt == null || jwt.isEmpty()) {
            throw new IllegalArgumentException("token 不能为空");
        }

        try {
            return Jwts.parser()
                    .setSigningKey(signKey)
                    .parseClaimsJws(jwt)
                    .getBody();
        } catch (Exception e) {
            throw new IllegalArgumentException("无效的 token", e);
        }
    }

}
