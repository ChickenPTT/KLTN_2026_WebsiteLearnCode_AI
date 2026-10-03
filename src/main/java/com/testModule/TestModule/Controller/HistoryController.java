package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Security.AuthUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    public record HistoryItem(Long id, Long problemId, String topic, String level, boolean passed, LocalDateTime submittedAt) {
    }

    private final HistorySubmitRepository historySubmitRepository;

    public HistoryController(HistorySubmitRepository historySubmitRepository) {
        this.historySubmitRepository = historySubmitRepository;
    }

//    Lich su nop bai cua chinh user dang dang nhap (moi nhat truoc)
    @GetMapping("/me")
    public List<HistoryItem> myHistory(@AuthenticationPrincipal AuthUserDetails user) {
        return historySubmitRepository.findByStudentIdOrderBySubmittedAtDesc(user.getUser().getId()).stream()
                .map(h -> new HistoryItem(
                        h.getId(),
                        h.getProblem().getId(),
                        h.getProblem().getTopic(),
                        h.getProblem().getLevel(),
                        h.isPassed(),
                        h.getSubmittedAt()))
                .toList();
    }
}
