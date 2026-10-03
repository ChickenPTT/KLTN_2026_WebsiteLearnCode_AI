package com.testModule.TestModule.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Body cua /api/run, /api/submit, /api/analyze.
 * languageId de trong -> dung ngon ngu mac dinh cua bai (problem.languageId).
 */
public record SubmitRequest(
        @JsonAlias("problem_id") Long problemId,
        @JsonAlias("source_code") String sourceCode,
        @JsonAlias("language_id") Integer languageId
) {
}
