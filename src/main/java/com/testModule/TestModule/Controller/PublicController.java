package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.TemplateRepository;
import com.testModule.TestModule.Repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final UserRepository userRepository;
    private final TemplateRepository templateRepository;
    private final ProblemRepository problemRepository;
    private final HistorySubmitRepository historySubmitRepository;

    public PublicController(
            UserRepository userRepository,
            TemplateRepository templateRepository,
            ProblemRepository problemRepository,
            HistorySubmitRepository historySubmitRepository
    ) {
        this.userRepository = userRepository;
        this.templateRepository = templateRepository;
        this.problemRepository = problemRepository;
        this.historySubmitRepository = historySubmitRepository;
    }

    /**
     * Public endpoint for landing page statistics.
     * Returns real data from the database without requiring authentication.
     */
    @GetMapping("/stats")
    public Map<String, Object> getPublicStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay();

        // Count total users (excluding admin/teacher if needed)
        long totalUsers = userRepository.count();

        // Count total templates (problem templates available)
        long totalTemplates = templateRepository.count();

        // Count total problems (AI generated + manual)
        long totalProblems = problemRepository.count();

        // Count published problems only
        long publishedProblems = problemRepository.countByStatus(Problem.Status.PUBLISHED);

        // Count submissions today
        long submissionsToday = historySubmitRepository.countSubmissionsToday(startOfDay);

        // Count total submissions in last 7 days
        long totalSubmissions7d = historySubmitRepository.countTotalSubmissionsLast7Days(sevenDaysAgo);

        // Count passed submissions in last 7 days
        long passedSubmissions7d = historySubmitRepository.countPassedSubmissionsLast7Days(sevenDaysAgo);

        // Calculate pass rate (percentage of submissions that passed)
        double passRate = 0.0;
        if (totalSubmissions7d > 0) {
            passRate = Math.round((passedSubmissions7d * 10000.0 / totalSubmissions7d) / 100.0);
        }

        return Map.of(
                "totalUsers", totalUsers,
                "totalTemplates", totalTemplates,
                "totalProblems", totalProblems,
                "publishedProblems", publishedProblems,
                "submissionsToday", submissionsToday,
                "totalSubmissions7d", totalSubmissions7d,
                "passedSubmissions7d", passedSubmissions7d,
                "passRate", passRate
        );
    }
}
