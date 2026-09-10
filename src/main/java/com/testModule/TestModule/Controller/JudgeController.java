package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.AiFeedback;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Service.GeminiService;
import com.testModule.TestModule.Service.HistoryService;
import com.testModule.TestModule.Service.JudgeService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class JudgeController {
    private final GeminiService geminiService;
    private final HistoryService historyService;
    private final JudgeService judgeService;
    private final ProblemRepository problemRepository;

    public JudgeController(GeminiService geminiService, HistoryService historyService, JudgeService judgeService, ProblemRepository problemRepository) {
        this.geminiService = geminiService;
        this.historyService = historyService;
        this.judgeService = judgeService;
        this.problemRepository = problemRepository;
    }

//    Test voi ko AI
    @PostMapping("/submit")
    public List<TestCaseResult> submitCode(@RequestBody Map<String, String> body) {
        String sourceCode = (String) body.get("source_code");
        Long problemId = Long.valueOf(body.get("problem_id").toString());

        try {
            Problem problem = problemRepository.findById(problemId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy problem_id: " + problemId));

            List<TestCase> testCases = problem.getTestCases().stream()
                    .map(tc -> new TestCase(tc.getInput(), tc.getExpectedOutput()))
                    .collect(Collectors.toList());

            List<TestCaseResult> testResults  = judgeService.runAllTestCases(sourceCode, problem.getLanguageId(), testCases);
            historyService.saveHistory(1L,problem,testResults );
            return testResults;
        }catch (RuntimeException e){
            throw new RuntimeException("Không tìm thấy problem_id: " + problemId);
        }
    }


    @GetMapping("testAi")
    public String testAi() {
        return geminiService.askGemini("Explain how AI works in a few words");
    }

//    test ai
    @PostMapping("/analyze")
    public Map<String, Object> analyzeSubmission(@RequestBody Map<String, String> body) {
        String sourceCode = body.get("source_code");
        Long problemId = Long.valueOf(body.get("problem_id").toString());

            Problem problem = problemRepository.findById(problemId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy problem_id: " + problemId));
            List<TestCase> testCases = problem.getTestCases().stream()
                    .map(tc -> new TestCase(tc.getInput(), tc.getExpectedOutput()))
                    .collect(Collectors.toList());

            List<TestCaseResult> testResults = judgeService.runAllTestCases(sourceCode, problem.getLanguageId(), testCases);
            AiFeedback aiFeedback = geminiService.analyzeCode(problem.getStatement(), sourceCode, testResults);

        historyService.saveHistory(1L,problem,testResults );
            Map<String, Object> response = new HashMap<>();
            response.put("testResults", testResults);
            response.put("aiFeedback", aiFeedback);
            return response;
    }
}
