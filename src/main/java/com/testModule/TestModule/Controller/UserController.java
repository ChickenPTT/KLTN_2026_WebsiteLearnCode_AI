package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.HistorySubmit;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.dto.UserStats;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final int XP_PER_SOLVED = 100;

    private final HistorySubmitRepository historySubmitRepository;

    public UserController(HistorySubmitRepository historySubmitRepository) {
        this.historySubmitRepository = historySubmitRepository;
    }

    @GetMapping("/stats")
    public UserStats getUserStats(@AuthenticationPrincipal AuthUserDetails user) {
        Long userId = user.getUser().getId();
        List<HistorySubmit> allSubmissions = historySubmitRepository.findByStudentIdOrderBySubmittedAtDesc(userId);

        // Moi bai chi tinh 1 lan du nop dat nhieu lan
        Set<Long> solvedProblemIds = new HashSet<>();
        Map<String, Integer> topicProgress = new HashMap<>();
        for (HistorySubmit h : allSubmissions) {
            if (h.isPassed() && solvedProblemIds.add(h.getProblem().getId())) {
                String topic = h.getProblem().getTopic() != null ? h.getProblem().getTopic() : "Khác";
                topicProgress.merge(topic, 1, Integer::sum);
            }
        }

        int solvedCount = solvedProblemIds.size();
        return new UserStats(
                calculateStreak(allSubmissions),
                solvedCount * XP_PER_SOLVED,
                solvedCount,
                allSubmissions.size(),
                topicProgress,
                user.getUser().getCreatedAt());
    }

//    So ngay lien tiep co nop bai, tinh lui tu hom nay (hoac hom qua neu hom nay chua nop)
    private int calculateStreak(List<HistorySubmit> submissions) {
        Set<LocalDate> activeDays = submissions.stream()
                .map(h -> h.getSubmittedAt().toLocalDate())
                .collect(Collectors.toSet());
        LocalDate day = LocalDate.now();
        if (!activeDays.contains(day)) day = day.minusDays(1);
        int streak = 0;
        while (activeDays.contains(day)) {
            streak++;
            day = day.minusDays(1);
        }
        return streak;
    }
}
