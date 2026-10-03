package com.testModule.TestModule.dto;

import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Model.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean onboardingCompleted,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isOnboardingCompleted(),
                user.getCreatedAt()
        );
    }
}
