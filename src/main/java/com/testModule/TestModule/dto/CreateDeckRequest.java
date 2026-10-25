package com.testModule.TestModule.dto;

import java.util.List;

public record CreateDeckRequest(
    String name,
    String description,
    String authorName,
    String authorRole,
    Boolean isPublic,
    List<TermRequest> terms
) {
}
