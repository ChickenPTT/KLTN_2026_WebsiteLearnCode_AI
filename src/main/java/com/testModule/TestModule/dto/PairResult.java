package com.testModule.TestModule.dto;

public class PairResult {

    private boolean isCorrect;
    private int matchedPairs;
    private int totalPairs;
    private long timeRemaining;
    private boolean roundCompleted;
    private boolean quizCompleted;

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public int getMatchedPairs() {
        return matchedPairs;
    }

    public void setMatchedPairs(int matchedPairs) {
        this.matchedPairs = matchedPairs;
    }

    public int getTotalPairs() {
        return totalPairs;
    }

    public void setTotalPairs(int totalPairs) {
        this.totalPairs = totalPairs;
    }

    public long getTimeRemaining() {
        return timeRemaining;
    }

    public void setTimeRemaining(long timeRemaining) {
        this.timeRemaining = timeRemaining;
    }

    public boolean isRoundCompleted() {
        return roundCompleted;
    }

    public void setRoundCompleted(boolean roundCompleted) {
        this.roundCompleted = roundCompleted;
    }

    public boolean isQuizCompleted() {
        return quizCompleted;
    }

    public void setQuizCompleted(boolean quizCompleted) {
        this.quizCompleted = quizCompleted;
    }
}
