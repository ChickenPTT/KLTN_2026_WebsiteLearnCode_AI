package com.testModule.TestModule.Model;

import jakarta.persistence.*;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(name = "contest_attempt_problems")
public class ContestAttemptProblem {

    // LOCKED: chua toi luot; OPEN: dang lam; SOLVED: dung; SKIPPED: bo qua; UNSOLVED: het gio / ket thuc som
    public enum Status { LOCKED, OPEN, SOLVED, SKIPPED, UNSOLVED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ContestAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    // Thu tu sau khi xao (0-based)
    @Column(nullable = false)
    private int position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.LOCKED;

    private LocalDateTime openedAt;

    private LocalDateTime solvedAt;

    @Column(nullable = false)
    private int submitCount;

    public ContestAttemptProblem() {
    }

    public ContestAttemptProblem(ContestAttempt attempt, Problem problem, int position) {
        this.attempt = attempt;
        this.problem = problem;
        this.position = position;
    }

    public long timeSeconds() {
        if (status != Status.SOLVED || openedAt == null || solvedAt == null) return 0;
        return Math.max(0, Duration.between(openedAt, solvedAt).getSeconds());
    }

    public Long getId() { return id; }

    public ContestAttempt getAttempt() { return attempt; }

    public Problem getProblem() { return problem; }

    public int getPosition() { return position; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getOpenedAt() { return openedAt; }
    public void setOpenedAt(LocalDateTime openedAt) { this.openedAt = openedAt; }

    public LocalDateTime getSolvedAt() { return solvedAt; }
    public void setSolvedAt(LocalDateTime solvedAt) { this.solvedAt = solvedAt; }

    public int getSubmitCount() { return submitCount; }
    public void setSubmitCount(int submitCount) { this.submitCount = submitCount; }
}
