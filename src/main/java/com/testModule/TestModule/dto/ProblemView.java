package com.testModule.TestModule.dto;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCaseEntity;

import java.time.LocalDateTime;
import java.util.List;


public record ProblemView(
        Long id,
        String statement,
        String topic,
        String level,
        int languageId,
        Problem.Status status,
        Problem.SourceType sourceType,
        LocalDateTime createdAt,
        List<Sample> samples,
        int testCaseCount,
        String templateName
) {
    /** So test case dau tien duoc cong khai lam vi du */
    public static final int SAMPLE_COUNT = 1;

    public record Sample(String input, String expectedOutput) {
    }

    public static ProblemView from(Problem p) {
        List<TestCaseEntity> testCases = p.getTestCases() == null ? List.of() : p.getTestCases();
        List<Sample> samples = testCases.stream()
                .limit(SAMPLE_COUNT)
                .map(tc -> new Sample(tc.getInput(), tc.getExpectedOutput()))
                .toList();
        String templateName = null;
        if(p.getTemplate() != null){
            templateName = p.getTemplate().getName();
        }
        return new ProblemView(
                p.getId(),
                p.getStatement(),
                p.getTopic(),
                p.getLevel(),
                p.getLanguageId(),
                p.getStatus(),
                p.getSourceType(),
                p.getCreatedAt(),
                samples,
                testCases.size(),
                templateName
        );
    }
}
