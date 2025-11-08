package com.stringtinyst.healthlife.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * 密码加密工具类
 * 使用 SHA-256 + Salt 进行密码哈希
 */
public class PasswordEncoder {

    private static final String ALGORITHM = "SHA-256";
    private static final int SALT_LENGTH = 16;

    /**
     * 生成随机盐值
     */
    private static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    /**
     * 对密码进行哈希加密
     * @param password 原始密码
     * @param salt 盐值
     * @return 哈希后的密码
     */
    private static String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance(ALGORITHM);
            md.update(salt.getBytes());
            byte[] hashedPassword = md.digest(password.getBytes());
            return Base64.getEncoder().encodeToString(hashedPassword);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("密码加密失败", e);
        }
    }

    /**
     * 加密密码（注册时使用）
     * @param rawPassword 原始密码
     * @return 格式：salt$hashedPassword
     */
    public static String encode(String rawPassword) {
        String salt = generateSalt();
        String hashedPassword = hashPassword(rawPassword, salt);
        return salt + "$" + hashedPassword;
    }

    /**
     * 验证密码（登录时使用）
     * @param rawPassword 原始密码
     * @param encodedPassword 存储的加密密码（格式：salt$hashedPassword）
     * @return 密码是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }

        String[] parts = encodedPassword.split("\\$");
        if (parts.length != 2) {
            return false;
        }

        String salt = parts[0];
        String storedHash = parts[1];
        String inputHash = hashPassword(rawPassword, salt);

        return storedHash.equals(inputHash);
    }
}
