package com.testModule.TestModule.dto;

import com.testModule.TestModule.Model.Role;

import java.time.LocalDateTime;

public record UserManagementDTO(
    Long id,
    String fullName,
    String email,
    Role role,
    boolean active,
    LocalDateTime createdAt,
    int solvedCount
) {
    public static UserManagementDTO from(com.testModule.TestModule.Model.User user, int solvedCount) {
        return new UserManagementDTO(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            user.isActive(),
            user.getCreatedAt(),
            solvedCount
        );
    }
}
