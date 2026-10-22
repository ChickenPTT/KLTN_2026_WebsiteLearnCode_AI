package com.testModule.TestModule.dto;

public record SubmitPairRequest(
        Long sessionId,
        String cellId1,
        String cellId2
) {
}
