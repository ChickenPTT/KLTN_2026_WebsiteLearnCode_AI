package com.testModule.TestModule.dto;

public record AdminFlashcardStats(
    int totalDecks,
    int totalTerms,
    int publicDecks,
    int unpublicDecks,
    int adminDecks,
    int teacherDecks,
    int studentDecks
) {
}
