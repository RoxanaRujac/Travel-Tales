package com.project.travel.mapper;

import com.project.travel.dto.UserCreationDTO;
import com.project.travel.model.User;

public class UserMapper {

    public static User toEntity(UserCreationDTO dto) {
        return User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }
}
