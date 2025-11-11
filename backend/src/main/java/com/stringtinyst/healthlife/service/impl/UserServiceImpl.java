package com.stringtinyst.healthlife.service.impl;

import com.stringtinyst.healthlife.mapper.UsersMapper;
import com.stringtinyst.healthlife.pojo.User;
import com.stringtinyst.healthlife.service.UserService;
import com.stringtinyst.healthlife.utils.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** User service implementation */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UsersMapper usersMapper;

  @Override
  public boolean registerUser(User user) {
    // 检查 Email 是否已存在
    int count = usersMapper.countByEmail(user.getEmail());
    if (count > 0) {
      return false; // Email 已存在，返回 false
    }

    // 对密码进行加密存储
    String encodedPassword = PasswordEncoder.encode(user.getPasswordHash());
    user.setPasswordHash(encodedPassword);

    // 插入用户数据
    int result = usersMapper.insertUser(user);
    return result > 0; // 插入成功返回 true，否则返回 false
  }

  @Override
  public String loginUser(User user) {
    // 根据邮箱查询用户
    User dbUser = usersMapper.getByEmail(user.getEmail());
    if (dbUser == null) {
      throw new RuntimeException("USER_NOT_FOUND"); // 用户不存在
    }

    // 验证密码
    boolean passwordMatches =
        PasswordEncoder.matches(user.getPasswordHash(), dbUser.getPasswordHash());
    if (!passwordMatches) {
      throw new RuntimeException("PASSWORD_INCORRECT"); // 密码不匹配
    }

    return dbUser.getUserID(); // 返回用户 ID
  }

  @Override
  public User getUser(String userID) {
    return usersMapper.getUser(userID);
  }

  @Override
  public boolean updateUser(User user) {
    return usersMapper.updateUser(user) > 0;
  }
}
