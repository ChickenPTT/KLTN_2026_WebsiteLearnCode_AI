package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
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

    public AdminDashboardService(
            UserRepository userRepository,
            TemplateRepository templateRepository,
            HistorySubmitRepository historySubmitRepository
    ) {
        this.userRepository = userRepository;
        this.templateRepository = templateRepository;
        this.historySubmitRepository = historySubmitRepository;
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

        return new AdminDashboardStats(
                totalUsers,
                totalTemplates,
                submissionsToday,
                aiAccuracy,
                weeklySubmissions,
                topTopics,
                levelDistribution,
                auditLogs
        );
    }

    private List<AdminDashboardStats.DailySubmission> getWeeklySubmissions(LocalDateTime sevenDaysAgo) {
        List<Object[]> results = historySubmitRepository.countSubmissionsByDayLast7Days(sevenDaysAgo);
        Map<LocalDate, Integer> dateToCount = results.stream()
                .collect(Collectors.toMap(
                        row -> (LocalDate) row[0],
                        row -> ((Number) row[1]).intValue()
                ));

        List<AdminDashboardStats.DailySubmission> weeklyData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        int maxCount = 1;

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int count = dateToCount.getOrDefault(date, 0);
            if (count > maxCount) maxCount = count;
            weeklyData.add(new AdminDashboardStats.DailySubmission(
                    getDayName(date.getDayOfWeek()),
                    count
            ));
        }

        final int finalMaxCount = maxCount;
        return weeklyData.stream()
                .map(d -> new AdminDashboardStats.DailySubmission(d.day(), d.count()))
                .collect(Collectors.toList());
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
        List<AdminDashboardStats.AuditLog> logs = new ArrayList<>();
        logs.add(new AdminDashboardStats.AuditLog(1L, "CREATE", "admin@school.edu", "Template đề thi", "5 phút trước"));
        logs.add(new AdminDashboardStats.AuditLog(2L, "UPDATE", "teacher1@school.edu", "Bài tập #45", "15 phút trước"));
        logs.add(new AdminDashboardStats.AuditLog(3L, "CREATE", "admin@school.edu", "Bài tập #46", "1 giờ trước"));
        logs.add(new AdminDashboardStats.AuditLog(4L, "DELETE", "teacher2@school.edu", "Template cũ", "2 giờ trước"));
        logs.add(new AdminDashboardStats.AuditLog(5L, "UPDATE", "admin@school.edu", "Người dùng #12", "3 giờ trước"));
        return logs;
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
