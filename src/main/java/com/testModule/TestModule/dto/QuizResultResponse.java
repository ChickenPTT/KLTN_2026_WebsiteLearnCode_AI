package com.testModule.TestModule.dto;

import java.util.List;

public class QuizResultResponse {

    private Long sessionId;
    private int totalRounds;
    private int totalScore;
    private int totalPairs;
    private List<RoundSummary> rounds;
    private boolean hasWrongTerms;

    public static class RoundSummary {
        private int roundNumber;
        private int score;
        private int totalPairs;
        private long timeSpent;
        private long timeLimit;
        private boolean isTimeout;

        public int getRoundNumber() {
            return roundNumber;
        }

        public void setRoundNumber(int roundNumber) {
            this.roundNumber = roundNumber;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public int getTotalPairs() {
            return totalPairs;
        }

        public void setTotalPairs(int totalPairs) {
            this.totalPairs = totalPairs;
        }

        public long getTimeSpent() {
            return timeSpent;
        }

        public void setTimeSpent(long timeSpent) {
            this.timeSpent = timeSpent;
        }

        public long getTimeLimit() {
            return timeLimit;
        }

        public void setTimeLimit(long timeLimit) {
            this.timeLimit = timeLimit;
        }

        public boolean isTimeout() {
            return isTimeout;
        }

        public void setTimeout(boolean timeout) {
            isTimeout = timeout;
        }
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public int getTotalRounds() {
        return totalRounds;
    }

    public void setTotalRounds(int totalRounds) {
        this.totalRounds = totalRounds;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getTotalPairs() {
        return totalPairs;
    }

    public void setTotalPairs(int totalPairs) {
        this.totalPairs = totalPairs;
    }

    public List<RoundSummary> getRounds() {
        return rounds;
    }

    public void setRounds(List<RoundSummary> rounds) {
        this.rounds = rounds;
    }

    public boolean isHasWrongTerms() {
        return hasWrongTerms;
    }

    public void setHasWrongTerms(boolean hasWrongTerms) {
        this.hasWrongTerms = hasWrongTerms;
    }
}
