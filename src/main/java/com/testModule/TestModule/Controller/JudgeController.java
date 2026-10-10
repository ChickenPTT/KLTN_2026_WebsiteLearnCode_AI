package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.AiFeedback;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseEntity;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.GeminiService;
import com.testModule.TestModule.Service.HistoryService;
import com.testModule.TestModule.Service.JudgeService;
import com.testModule.TestModule.Service.ProblemService;
import com.testModule.TestModule.dto.ProblemView;
import com.testModule.TestModule.dto.SubmitRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api")
public class JudgeController {
    // Judge0 language_id duoc phep: 50 C, 54 C++, 62 Java, 71 Python
    private static final Set<Integer> ALLOWED_LANGUAGES = Set.of(50, 54, 62, 71);
    private static final int MAX_SOURCE_LENGTH = 50_000;

    private final GeminiService geminiService;
    private final HistoryService historyService;
    private final JudgeService judgeService;
    private final ProblemService problemService;

    public JudgeController(GeminiService geminiService, HistoryService historyService, JudgeService judgeService, ProblemService problemService) {
        this.geminiService = geminiService;
        this.historyService = historyService;
        this.judgeService = judgeService;
        this.problemService = problemService;
    }

//    Chay thu: chi chay test case mau (vi du), khong luu lich su, khong goi AI
    @PostMapping("/run")
    public Map<String, Object> runSample(@RequestBody SubmitRequest body, @AuthenticationPrincipal AuthUserDetails user) {
        Problem problem = loadProblem(body, user);
        List<TestCaseResult> testResults = judge(body, problem, problem.getTestCases().stream().limit(ProblemView.SAMPLE_COUNT));
        return Map.of("passed", allPassed(testResults), "testResults", testResults);
    }

//    Test voi ko AI
    @PostMapping("/submit")
    public List<TestCaseResult> submitCode(@RequestBody SubmitRequest body, @AuthenticationPrincipal AuthUserDetails user) {
        Problem problem = loadProblem(body, user);
        List<TestCaseResult> testResults = judge(body, problem, problem.getTestCases().stream());
        historyService.saveHistory(user.getUser().getId(), problem, testResults);
        return testResults;
    }

//    Cham toan bo test case + AI phan tich (FE dung endpoint nay cho nut "Nop bai")
    @PostMapping("/analyze")
    public Map<String, Object> analyzeSubmission(@RequestBody SubmitRequest body, @AuthenticationPrincipal AuthUserDetails user) {
        Problem problem = loadProblem(body, user);
        List<TestCaseResult> testResults = judge(body, problem, problem.getTestCases().stream());
        historyService.saveHistory(user.getUser().getId(), problem, testResults);

        Map<String, Object> response = new HashMap<>();
        response.put("passed", allPassed(testResults));
        response.put("testResults", testResults);
        try {
            AiFeedback aiFeedback = geminiService.analyzeCode(problem.getStatement(), body.sourceCode(), testResults);
            response.put("aiFeedback", aiFeedback);
        } catch (RuntimeException e) {
            // AI loi (het quota, sai JSON...) van tra ket qua cham, chi bo phan nhan xet
            System.err.println("[AI] Không phân tích được bài nộp: " + e.getMessage());
            response.put("aiFeedback", null);
            response.put("aiError", "AI tạm thời không phân tích được bài này. Kết quả chấm vẫn hợp lệ.");
        }
        return response;
    }

    private Problem loadProblem(SubmitRequest body, AuthUserDetails user) {
        if (body == null || body.problemId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu problem_id.");
        }
        if (body.sourceCode() == null || body.sourceCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa có code để chấm.");
        }
        if (body.sourceCode().length() > MAX_SOURCE_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code quá dài.");
        }
        Problem problem = problemService.getProblemById(body.problemId());
        // Sinh vien chi duoc lam bai da xuat ban; giang vien/admin duoc chay thu ca de nhap
        boolean staff = user.getUser().getRole() != Role.STUDENT;
        if (problem.getStatus() != Problem.Status.PUBLISHED && !staff) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài tập id: " + body.problemId());
        }
        if (problem.getTestCases() == null || problem.getTestCases().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bài tập chưa có test case.");
        }
        return problem;
    }

    private List<TestCaseResult> judge(SubmitRequest body, Problem problem, Stream<TestCaseEntity> testCaseStream) {
        int languageId = body.languageId() != null ? body.languageId() : problem.getLanguageId();
        if (!ALLOWED_LANGUAGES.contains(languageId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngôn ngữ không được hỗ trợ.");
        }
        List<TestCase> testCases = testCaseStream
                .map(tc -> new TestCase(tc.getInput(), tc.getExpectedOutput()))
                .toList();
        return judgeService.runAllTestCases(body.sourceCode(), languageId, testCases);
    }

    private static boolean allPassed(List<TestCaseResult> results) {
        return results.stream().allMatch(TestCaseResult::isPassed);
    }
}
