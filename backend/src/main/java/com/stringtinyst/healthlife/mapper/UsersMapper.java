package com.stringtinyst.healthlife.mapper;

import com.stringtinyst.healthlife.pojo.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UsersMapper {

    @Insert("INSERT INTO users (UserID, Email, PasswordHash,Nickname,Gender,DateOfBirth) VALUES (#{userID}, #{email}, #{passwordHash},#{nickname},#{gender},#{dateOfBirth})")
    int insertUser(User user);

    @Select("SELECT COUNT(*) FROM users WHERE Email = #{email}")
    int countByEmail(String email);

    @Select("SELECT * FROM users WHERE Email = #{email}")
    User getByEmail(String email);

    @Select("SELECT UserID FROM users WHERE Email = #{email} AND PasswordHash = #{passwordHash}")
    String getByemailAndPassword(String email, String passwordHash);

    @Select("SELECT * FROM users WHERE UserID = #{userID}")
    User getUser(String userID);
//    @Update("UPDATE users SET Email = #{email}, PasswordHash = #{passwordHash}, Nickname = #{nickname}, Gender = #{gender}, DateOfBirth = #{dateOfBirth} WHERE UserID = #{userID}")
    int updateUser(User user);
}
