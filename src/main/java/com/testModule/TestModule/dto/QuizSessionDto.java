package com.testModule.TestModule.dto;

/**
 * DTO for quiz session history — avoids circular reference with FlashcardDeck.
 */
public record QuizSessionDto(
        Long id,
        String quizType,
        String status,
        Integer currentRound,
        Integer totalRounds,
        String createdAt,
        Long deckId,
        String deckName,
        Integer deckWordCount
) {
}
