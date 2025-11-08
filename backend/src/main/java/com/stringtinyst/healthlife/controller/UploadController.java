package com.stringtinyst.healthlife.controller;

import com.stringtinyst.healthlife.pojo.Result;
import com.stringtinyst.healthlife.utils.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
public class UploadController {

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/avatar")
    public Result uploadAvatar(@RequestParam("avatar") MultipartFile avatar,
                               @RequestHeader("token") String token) {
        String userId = extractUserIdFromToken(token);

        if (avatar.isEmpty()) {
            return Result.error("上传的头像文件为空");
        }

        try {
            String uploadDir = System.getenv("AVATAR_UPLOAD_DIR");
            if (uploadDir == null || uploadDir.isEmpty()) {
                uploadDir = "src/main/resources/static/avatars/";
            }

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = avatar.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String[] extensions = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"};
            for (String ext : extensions) {
                Path oldFile = uploadPath.resolve(userId + ext);
                if (Files.exists(oldFile)) {
                    Files.delete(oldFile);
                }
            }

            String savedFileName = userId + fileExtension;
            Path filePath = uploadPath.resolve(savedFileName);

            avatar.transferTo(filePath);

            return Result.success("头像上传成功");

        } catch (IOException e) {
            log.error("头像上传失败", e);
            return Result.error("头像上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/avatar")
    public ResponseEntity<Resource> getAvatar(HttpServletRequest request,
                                              @RequestHeader(value = "token", required = false) String tokenHeader) {
        String token = tokenHeader;
        if (!StringUtils.hasLength(token)) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (!StringUtils.hasLength(token)) {
            log.warn("获取头像失败: 未提供 token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = extractUserIdFromToken(token);

        String uploadDir = System.getenv("AVATAR_UPLOAD_DIR");
        if (uploadDir == null || uploadDir.isEmpty()) {
            uploadDir = "src/main/resources/static/avatars/";
        }
        Path uploadPath = Paths.get(uploadDir);

        String[] extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"};
        Path foundFile = null;

        for (String ext : extensions) {
            Path testFile = uploadPath.resolve(userId + ext);
            if (Files.exists(testFile)) {
                foundFile = testFile;
                break;
            }
        }

        if (foundFile == null) {
            log.warn("用户头像不存在: userId={}", userId);
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(foundFile);

        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            log.error("头像文件不可读: {}", foundFile);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String extractUserIdFromToken(String token) {
        try {
            Map<String, Object> claims = jwtUtils.parseJWT(token);
            Object userId = claims.get("userID");
            if (userId == null || userId.toString().isEmpty()) {
                throw new IllegalArgumentException("Token 中未包含 userID");
            }
            return userId.toString();
        } catch (Exception e) {
            throw new IllegalArgumentException("无效的 token 或 token 中无 userId");
        }
    }
}
