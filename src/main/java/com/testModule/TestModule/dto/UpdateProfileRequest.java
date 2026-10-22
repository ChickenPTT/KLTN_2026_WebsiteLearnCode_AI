package com.testModule.TestModule.dto;

public record UpdateProfileRequest(
    String fullName,
    String email
) {
}
