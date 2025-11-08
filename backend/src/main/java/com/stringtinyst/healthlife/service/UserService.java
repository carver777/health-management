package com.stringtinyst.healthlife.service;

import com.stringtinyst.healthlife.pojo.User;

public interface UserService {
    boolean registerUser(User user);

    String loginUser(User user);

    User getUser(String userID);

    boolean updateUser(User user);
}
