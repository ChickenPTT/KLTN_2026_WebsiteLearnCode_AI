package com.testModule.TestModule.Service;


import com.testModule.TestModule.Model.*;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.TemplateRepository;
import com.testModule.TestModule.Service.IF.IProblemGenerator;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProblemGeneratorService implements IProblemGenerator {

    private static final int Number_Tescase = 4;

    private final TemplateRepository templateRepository;
    private final ProblemRepository problemRepository;
    private final JudgeService judgeService;
    private final GeminiService geminiService;
    private final Random random = new Random();


    public ProblemGeneratorService(TemplateRepository templateRepository,
                                   ProblemRepository problemRepository,
                                   JudgeService judgeService,
                                   GeminiService geminiService) {
        this.templateRepository = templateRepository;
        this.problemRepository = problemRepository;
        this.judgeService = judgeService;
        this.geminiService = geminiService;
    }

//    function sinh ra biến thể của 1 template
    @Override
    public Problem generateVariant(Long templateId, boolean useAiParaphrase) {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy template_id: " + templateId));


        // Bước 1: random input + chạy reference solution để lấy output chuẩn
        List<TestCaseEntity> testCases = new ArrayList<>();
        for (int i = 0; i < Number_Tescase; i++) {
            String input = generateInput(template);

            Map<String, Object> result = judgeService.runCode(
                    template.getReferenceSolutionCode(), template.getLanguageId(), input);

            String expectedOutput = "";
            if (result.get("stdout_decoded") != null) {
                expectedOutput = ((String) result.get("stdout_decoded")).trim();
            } else {
                // Reference solution mà chạy lỗi thì dừng ngay, không lưu variant hỏng
                throw new RuntimeException("Reference solution lỗi với input: " + input
                        + " | chi tiết: " + result.get("message"));
            }

            TestCaseEntity tc = new TestCaseEntity();
            tc.setInput(input);
            tc.setExpectedOutput(expectedOutput);
            testCases.add(tc);
        }

        // Bước 2: paraphrase đề bài (tùy chọn)
        String finalStatement = template.getStatementPattern();
        if (useAiParaphrase) {
            String prompt = "Viết lại đề bài lập trình sau bằng ngữ cảnh/tên biến khác, "
                    + "GIỮ NGUYÊN yêu cầu đầu vào/đầu ra và độ khó, chỉ đổi cách diễn đạt. "
                    + "Chỉ trả về đề bài đã viết lại, không thêm lời dẫn:\n\n"
                    + template.getStatementPattern();
            finalStatement = geminiService.askGemini(prompt);
        }

        // Bước 3: lưu thành Problem mới, status = DRAFT
        Problem problem = new Problem();
        problem.setStatement(finalStatement);
        problem.setLanguageId(template.getLanguageId());
        problem.setTopic(template.getTopic().getName());
        problem.setLevel(template.getLevel());
        problem.setStatus(Problem.Status.DRAFT);
        problem.setSourceType(Problem.SourceType.AI_GENERATED);
        problem.setTemplate(template);
        problem.setReferenceSolution(template.getReferenceSolutionCode());

        // Gắn từng test case về đúng problem này (bắt buộc vì quan hệ 2 chiều)
        for (TestCaseEntity tc : testCases) {
            tc.setProblem(problem);
        }
        problem.setTestCases(testCases);

        return problemRepository.save(problem); // cascade lưu luôn cả test case
    }

    // Random input dựa vào generatorType của template
    private String generateInput(Template template) {
        switch (template.getGeneratorType()) {
            case TWO_INTEGERS -> {
                int a = randomInRange(template.getMinValue(), template.getMaxValue());
                int b = randomInRange(template.getMinValue(), template.getMaxValue());
                return a + " " + b;
            }
            case INTEGER_ARRAY -> {
                int n = randomInRange(template.getMinN(), template.getMaxN());
                StringBuilder arr = new StringBuilder();
                for (int i = 0; i < n; i++) {
                    if (i > 0) arr.append(" ");
                    arr.append(randomInRange(template.getMinValue(), template.getMaxValue()));
                }
                return n + "\n" + arr;
            }
            case STRING_BASIC -> {
                int len = randomInRange(template.getMinN(), template.getMaxN());
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < len; i++) {
                    sb.append((char) ('a' + random.nextInt(26)));
                }
                return sb.toString();
            }
            default -> throw new RuntimeException("generatorType chưa được hỗ trợ: " + template.getGeneratorType());
        }
    }

    private int randomInRange(int min, int max) {
        return min + random.nextInt(max - min + 1);
    }
}
