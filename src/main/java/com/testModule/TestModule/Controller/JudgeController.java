package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.AiFeedback;
import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Service.GeminiService;
import com.testModule.TestModule.Service.JudgeService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class JudgeController {
    private final GeminiService geminiService;

    private final JudgeService judgeService;

    public JudgeController(GeminiService geminiService, JudgeService judgeService, ProblemRepository problemRepository) {
        this.geminiService = geminiService;
        this.judgeService = judgeService;
        this.problemRepository = problemRepository;
    }
    private final ProblemRepository problemRepository;

//    Test voi ko AI
    @PostMapping("/submit")
    public List<TestCaseResult> submitCode(@RequestBody Map<String, String> body) {
        String sourceCode = body.get("source_code");

        List<TestCase> testCases = Arrays.asList(
                new TestCase("3 5", "8"),
                new TestCase("10 20", "30"),
                new TestCase("-1 1", "0")
        );

        return judgeService.runAllTestCases(sourceCode, 71, testCases);
    }


    @GetMapping("testAi")
    public String testAi() {
        return geminiService.askGemini("Explain how AI works in a few words");
    }

//    test ai
    @PostMapping("/analyze")
    public Map<String, Object> analyzeSubmission(@RequestBody Map<String, String> body) {
        String sourceCode = body.get("source_code");

        String problemStatement = "Cho một mảng gồm n số nguyên. Hãy sắp xếp mảng theo thứ tự tăng dần. "
                + "Input: dòng 1 là số nguyên n, dòng 2 là n số nguyên cách nhau bởi dấu cách. "
                + "Output: in ra mảng đã sắp xếp, các số cách nhau bởi dấu cách.";

        List<TestCase> testCases = Arrays.asList(
                new TestCase("5\n3 1 4 1 5", "1 1 3 4 5"),
                new TestCase("3\n9 8 7", "7 8 9"),
                new TestCase("4\n-2 5 0 -1", "-2 -1 0 5")
        );


        List<TestCaseResult> testResults = judgeService.runAllTestCases(sourceCode, 71, testCases);
        AiFeedback aiFeedback = geminiService.analyzeCode(problemStatement,sourceCode,testResults  );
        Map<String, Object> response = new HashMap<>();
        response.put("testResults",testResults);
        response.put("aiFeedback",aiFeedback);

        return response;

    }

}
