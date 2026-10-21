package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.AuditLog;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Repository.AuditLogRepository;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.TemplateRepository;
import com.testModule.TestModule.Repository.UserRepository;
import com.testModule.TestModule.dto.AdminDashboardStats;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final TemplateRepository templateRepository;
    private final HistorySubmitRepository historySubmitRepository;
    private final ProblemRepository problemRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            TemplateRepository templateRepository,
            HistorySubmitRepository historySubmitRepository,
            ProblemRepository problemRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.userRepository = userRepository;
        this.templateRepository = templateRepository;
        this.historySubmitRepository = historySubmitRepository;
        this.problemRepository = problemRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public AdminDashboardStats getDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay();

        int totalUsers = (int) userRepository.count();
        int totalTemplates = (int) templateRepository.count();
        int submissionsToday = (int) historySubmitRepository.countSubmissionsToday(startOfDay);
        double aiAccuracy = 96.4; // Placeholder - can be calculated from actual AI feedback data

        List<AdminDashboardStats.DailySubmission> weeklySubmissions = getWeeklySubmissions(sevenDaysAgo);
        List<AdminDashboardStats.TopicStats> topTopics = getTopTopics();
        List<AdminDashboardStats.LevelStats> levelDistribution = getLevelDistribution();
        List<AdminDashboardStats.AuditLog> auditLogs = getAuditLogs();

        // Real submission stats for last 7 days
        int totalSubmissions7d = (int) historySubmitRepository.countTotalSubmissionsLast7Days(sevenDaysAgo);
        int passedSubmissions7d = (int) historySubmitRepository.countPassedSubmissionsLast7Days(sevenDaysAgo);

        // Real AI-generated problem stats
        int totalAiGeneratedProblems = (int) problemRepository.countBySourceType(Problem.SourceType.AI_GENERATED);
        int publishedAiGeneratedProblems = (int) problemRepository.countBySourceTypeAndStatus(
                Problem.SourceType.AI_GENERATED, Problem.Status.PUBLISHED);

        return new AdminDashboardStats(
                totalUsers,
                totalTemplates,
                submissionsToday,
                aiAccuracy,
                weeklySubmissions,
                topTopics,
                levelDistribution,
                auditLogs,
                totalSubmissions7d,
                passedSubmissions7d,
                totalAiGeneratedProblems,
                publishedAiGeneratedProblems
        );
    }

    private List<AdminDashboardStats.DailySubmission> getWeeklySubmissions(LocalDateTime sevenDaysAgo) {
        List<Object[]> results = historySubmitRepository.countSubmissionsByDayLast7Days(sevenDaysAgo);
        Map<LocalDate, int[]> dateToCounts = results.stream()
                .collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> new int[]{((Number) row[1]).intValue(), ((Number) row[2]).intValue()}
                ));

        List<AdminDashboardStats.DailySubmission> weeklyData = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int[] counts = dateToCounts.getOrDefault(date, new int[]{0, 0});
            int count = counts[0];
            int passed = counts[1];
            weeklyData.add(new AdminDashboardStats.DailySubmission(
                    getDayName(date.getDayOfWeek()),
                    count,
                    passed
            ));
        }

        return weeklyData;
    }

    private List<AdminDashboardStats.TopicStats> getTopTopics() {
        List<Object[]> results = historySubmitRepository.countSubmissionsByTopic();
        int total = results.stream()
                .mapToInt(row -> ((Number) row[1]).intValue())
                .sum();

        String[] colors = {"#78d39e", "#5e8dfa", "#f5c95d", "#a995ff", "#f08a8a"};

        List<AdminDashboardStats.TopicStats> topicStats = new ArrayList<>();
        for (int i = 0; i < Math.min(results.size(), 5); i++) {
            Object[] row = results.get(i);
            String topic = (String) row[0];
            int count = ((Number) row[1]).intValue();
            int percentage = total > 0 ? (count * 100 / total) : 0;
            String color = colors[i % colors.length];
            topicStats.add(new AdminDashboardStats.TopicStats(topic, count, percentage, color));
        }
        return topicStats;
    }

    private List<AdminDashboardStats.LevelStats> getLevelDistribution() {
        List<Object[]> roleResults = userRepository.countUsersByRole();
        int total = roleResults.stream()
                .mapToInt(row -> ((Number) row[1]).intValue())
                .sum();

        Map<String, String> levelColors = Map.of(
                "ADMIN", "#a995ff",
                "TEACHER", "#f5c95d",
                "STUDENT", "#5e8dfa"
        );

        Map<String, String> levelLabels = Map.of(
                "ADMIN", "Nâng cao (Expert)",
                "TEACHER", "Khá (Advanced)",
                "STUDENT", "Trung bình (Intermediate)"
        );

        return roleResults.stream()
                .map(row -> {
                    Role role = (Role) row[0];
                    int count = ((Number) row[1]).intValue();
                    int percentage = total > 0 ? (count * 100 / total) : 0;
                    String label = levelLabels.getOrDefault(role.name(), role.name());
                    String color = levelColors.getOrDefault(role.name(), "#78d39e");
                    return new AdminDashboardStats.LevelStats(label, count, percentage, color);
                })
                .collect(Collectors.toList());
    }

    private List<AdminDashboardStats.AuditLog> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        return logs.stream()
            .limit(5)
            .map(log -> {
                String time = formatRelativeTime(log.getCreatedAt());
                return new AdminDashboardStats.AuditLog(
                    log.getId(),
                    log.getAction(),
                    log.getUsername(),
                    log.getTarget(),
                    time
                );
            })
            .collect(Collectors.toList());
    }

    private String formatRelativeTime(LocalDateTime createdAt) {
        LocalDateTime now = LocalDateTime.now();
        long seconds = java.time.Duration.between(createdAt, now).getSeconds();

        if (seconds < 60) {
            return "Vừa xong";
        } else if (seconds < 3600) {
            long minutes = seconds / 60;
            return minutes + " phút trước";
        } else if (seconds < 86400) {
            long hours = seconds / 3600;
            return hours + " giờ trước";
        } else if (seconds < 604800) {
            long days = seconds / 86400;
            return days + " ngày trước";
        } else {
            long weeks = seconds / 604800;
            return weeks + " tuần trước";
        }
    }

    private String getDayName(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "T2";
            case TUESDAY -> "T3";
            case WEDNESDAY -> "T4";
            case THURSDAY -> "T5";
            case FRIDAY -> "T6";
            case SATURDAY -> "T7";
            case SUNDAY -> "CN";
        };
    }
}
