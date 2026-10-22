package com.testModule.TestModule.dto;

import com.testModule.TestModule.Model.QuizSession;

public record StartQuizRequest(
        QuizSession.QuizType quizType,
        Long deckId,
        java.util.List<Long> deckIds
) {
}
