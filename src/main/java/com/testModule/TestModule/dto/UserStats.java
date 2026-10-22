package com.testModule.TestModule.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record UserStats(
    int streak,
    int totalXp,
    int solvedCount,
    int totalSubmissions,
    Map<String, Integer> topicProgress,
    LocalDateTime joinedAt
) {
}
