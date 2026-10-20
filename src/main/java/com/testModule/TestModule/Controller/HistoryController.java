package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.HistorySubmit;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Security.AuthUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    public record HistoryItem(Long id, Long problemId, String problemTitle, String topic, String level, boolean passed,
                              LocalDateTime submittedAt, Integer languageId, Integer passedCount, Integer totalCount,
                              Double maxTime, Integer maxMemory, String aiSeverity) {
    }

    public record AiFeedbackView(String errorType, List<Integer> suspectedLines, String explanation, String hint,
                                 String severity) {
    }

    /** Chi tiet 1 lan nop: them code da nop va nhan xet AI */
    public record HistoryDetail(HistoryItem summary, String sourceCode, AiFeedbackView aiFeedback) {
    }

    private final HistorySubmitRepository historySubmitRepository;

    public HistoryController(HistorySubmitRepository historySubmitRepository) {
        this.historySubmitRepository = historySubmitRepository;
    }

//    Lich su nop bai cua chinh user dang dang nhap (moi nhat truoc)
    @GetMapping("/me")
    public List<HistoryItem> myHistory(@AuthenticationPrincipal AuthUserDetails user) {
        return historySubmitRepository.findByStudentIdOrderBySubmittedAtDesc(user.getUser().getId()).stream()
                .map(HistoryController::toItem)
                .toList();
    }

//    Chi tiet 1 lan nop — chi xem duoc bai cua chinh minh
    @GetMapping("/me/{id}")
    public HistoryDetail myHistoryDetail(@AuthenticationPrincipal AuthUserDetails user, @PathVariable Long id) {
        HistorySubmit h = historySubmitRepository.findById(id)
                .filter(found -> Objects.equals(found.getStudentId(), user.getUser().getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lần nộp bài."));
        AiFeedbackView feedback = null;
        if (h.getAiExplanation() != null || h.getAiHint() != null || h.getAiErrorType() != null) {
            feedback = new AiFeedbackView(h.getAiErrorType(), parseLines(h.getAiSuspectedLines()),
                    h.getAiExplanation(), h.getAiHint(), h.getAiSeverity());
        }
        return new HistoryDetail(toItem(h), h.getSourceCode(), feedback);
    }

    private static HistoryItem toItem(HistorySubmit h) {
        Problem p = h.getProblem();
        return new HistoryItem(
                h.getId(),
                p.getId(),
                problemTitle(p),
                p.getTopic(),
                p.getLevel(),
                h.isPassed(),
                h.getSubmittedAt(),
                h.getLanguageId() != null ? h.getLanguageId() : p.getLanguageId(),
                h.getPassedCount(),
                h.getTotalCount(),
                h.getMaxTime(),
                h.getMaxMemory(),
                h.getAiSeverity());
    }

//    Ten bai = ten template neu co, khong thi dong dau cua de bai (giong FE titleFromStatement)
    private static String problemTitle(Problem p) {
        if (p.getTemplate() != null && p.getTemplate().getName() != null && !p.getTemplate().getName().isBlank()) {
            return p.getTemplate().getName();
        }
        String statement = p.getStatement() == null ? "" : p.getStatement();
        String firstLine = Arrays.stream(statement.split("\n"))
                .map(s -> s.replaceAll("^[#*\\->\\s]+|[*`]+", "").trim())
                .filter(s -> !s.isEmpty())
                .findFirst()
                .orElse(null);
        if (firstLine == null) return "Bài tập #" + p.getId();
        return firstLine.length() > 80 ? firstLine.substring(0, 77) + "..." : firstLine;
    }

    private static List<Integer> parseLines(String lines) {
        if (lines == null || lines.isBlank()) return List.of();
        return Arrays.stream(lines.split(","))
                .map(String::trim)
                .filter(s -> s.matches("\\d+"))
                .map(Integer::valueOf)
                .toList();
    }
}
