package com.testModule.TestModule.dto;

import java.time.LocalDateTime;

public record AuditLogDto(
    Long id,
    String action,
    // Đặt tên "user" cho khớp với frontend (AuditLog.user trong lib/api.ts) và AdminDashboardStats.AuditLog
    String user,
    String target,
    String time
) {
    public static AuditLogDto from(com.testModule.TestModule.Model.AuditLog log) {
        String time = formatRelativeTime(log.getCreatedAt());
        return new AuditLogDto(
            log.getId(),
            log.getAction(),
            log.getUsername(),
            log.getTarget(),
            time
        );
    }

    private static String formatRelativeTime(LocalDateTime createdAt) {
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
        } else if (seconds < 2592000) {
            long weeks = seconds / 604800;
            return weeks + " tuần trước";
        } else {
            // Định dạng ngày tháng cho log cũ
            java.time.format.DateTimeFormatter formatter =
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            return createdAt.format(formatter);
        }
    }
}
