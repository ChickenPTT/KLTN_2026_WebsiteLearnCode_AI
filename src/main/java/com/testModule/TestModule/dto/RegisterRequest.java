package com.testModule.TestModule.dto;

// code: ma xac nhan 6 so gui toi email (bat buoc khi bat xac nhan email)
public record RegisterRequest(String email, String password, String fullName, String code) {
}
