package com.stringtinyst.healthlife.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * User entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String userID;
    private String email;
    private String passwordHash;
    private String nickname;
    private String gender;
    private LocalDate dateOfBirth;
}
