package com.testModule.TestModule.dto;

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword
) {
}
