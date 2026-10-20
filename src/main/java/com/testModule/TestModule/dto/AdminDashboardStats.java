package com.testModule.TestModule.dto;

import java.util.List;

public record AdminDashboardStats(
    int totalUsers,
    int totalTemplates,
    int submissionsToday,
    double aiAccuracy,
    List<DailySubmission> weeklySubmissions,
    List<TopicStats> topTopics,
    List<LevelStats> levelDistribution,
    List<AuditLog> auditLogs,
    int totalSubmissions7d,
    int passedSubmissions7d,
    int totalAiGeneratedProblems,
    int publishedAiGeneratedProblems
) {
    public record DailySubmission(String day, int count, int passed) {}
    public record TopicStats(String name, int count, int percentage, String color) {}
    public record LevelStats(String level, int count, int percentage, String color) {}
    public record AuditLog(Long id, String action, String user, String target, String time) {}
}
