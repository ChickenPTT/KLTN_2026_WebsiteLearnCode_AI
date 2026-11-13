package com.testModule.TestModule.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.testModule.TestModule.Model.ContestAttempt;
import com.testModule.TestModule.Model.ContestAttemptProblem;
import com.testModule.TestModule.Model.Season;
import com.testModule.TestModule.Model.TestCaseResult;

import java.time.LocalDateTime;
import java.util.List;

public final class ContestDtos {

    private ContestDtos() {
    }

    public record SeasonView(
            Long id,
            String name,
            String description,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Season.Status status,
            int problemCount,
            int maxAttempts,
            int timeLimitMinutes,
            long participants
    ) {
    }

    public record BestResult(int attemptNo, int solvedCount, long totalTimeSeconds) {
    }

    public record AttemptSummary(
            Long id,
            int attemptNo,
            ContestAttempt.Status status,
            LocalDateTime startedAt,
            LocalDateTime finishedAt,
            int solvedCount,
            long totalTimeSeconds
    ) {
    }

    public record MyStanding(
            int attemptsUsed,
            int attemptsLeft,
            Long inProgressAttemptId,
            BestResult best,
            Integer rank,
            List<AttemptSummary> attempts,
            boolean registered
    ) {
    }

    public record CurrentView(SeasonView season, MyStanding me, LocalDateTime serverNow) {
    }

    public record LeaderboardRow(
            int rank,
            Long userId,
            String name,
            int solvedCount,
            int attemptsUsed,
            long totalTimeSeconds,
            boolean me
    ) {
    }

    public record ProblemSlot(int position, ContestAttemptProblem.Status status, int submitCount, long timeSeconds) {
    }

    public record CurrentProblem(
            int position,
            Long problemId,
            String title,
            String statement,
            String topic,
            String level,
            int languageId,
            List<ProblemView.Sample> samples,
            LocalDateTime openedAt
    ) {
    }

    public record AttemptView(
            Long id,
            Long seasonId,
            String seasonName,
            int attemptNo,
            int maxAttempts,
            ContestAttempt.Status status,
            LocalDateTime startedAt,
            LocalDateTime deadlineAt,
            LocalDateTime finishedAt,
            LocalDateTime serverNow,
            int solvedCount,
            long totalTimeSeconds,
            List<ProblemSlot> problems,
            CurrentProblem current
    ) {
    }

    public record CodeRequest(
            @JsonAlias("source_code") String sourceCode,
            @JsonAlias("language_id") Integer languageId
    ) {
    }

    public record RunView(boolean passed, List<TestCaseResult> testResults) {
    }

    public record SubmitView(
            boolean passed,
            int passedCount,
            int totalCount,
            List<TestCaseResult> testResults,
            AttemptView attempt
    ) {
    }

    // ── Admin ──
    public record SeasonWriteRequest(
            String name,
            String description,
            LocalDateTime startAt,
            LocalDateTime endAt,
            Integer maxAttempts,
            Integer timeLimitMinutes
    ) {
    }

    public record SeasonProblemsRequest(List<Long> problemIds) {
    }

    public record AdminSeasonProblem(int position, Long problemId, String title, String topic, String level) {
    }

    public record AdminSeasonView(SeasonView season, List<AdminSeasonProblem> problems, boolean hasAttempts) {
    }

    // Bai trong kho de cua mua (da sinh / lay tu ngan hang), selected = dang nam trong bo 4 de
    public record AdminPoolProblem(
            Long problemId,
            String title,
            String topic,
            String level,
            String statement,
            List<ProblemView.Sample> samples,
            int testCaseCount,
            String sourceType,
            boolean selected,
            Integer position,
            LocalDateTime createdAt,
            String referenceSolution
    ) {
    }

    public record PoolGenerateRequest(Long templateId, Boolean useAiParaphrase) {
    }

    public record PoolAddRequest(Long problemId) {
    }

    // Thanh tuu ca nhan (tinh tu ket qua thi); icon/rarity khop voi giao dien League
    public record AchievementView(
            String id,
            String title,
            String desc,
            String icon,
            String rarity,
            boolean earned,
            LocalDateTime date
    ) {
    }
}
