package com.testModule.TestModule.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "contest_attempts",
        uniqueConstraints = @UniqueConstraint(name = "uk_attempt_user_season_no", columnNames = {"user_id", "season_id", "attempt_no"})
)
public class ContestAttempt {

    public enum Status { IN_PROGRESS, FINISHED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @Column(name = "attempt_no", nullable = false)
    private int attemptNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.IN_PROGRESS;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Column(nullable = false)
    private LocalDateTime deadlineAt;

    private LocalDateTime finishedAt;

    @Column(nullable = false)
    private int solvedCount;

    // Tong thoi gian (giay) cua cac bai lam dung: tu luc mo bai den luc dung
    @Column(nullable = false)
    private long totalTimeSeconds;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ContestAttemptProblem> problems = new ArrayList<>();

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Season getSeason() { return season; }
    public void setSeason(Season season) { this.season = season; }

    public int getAttemptNo() { return attemptNo; }
    public void setAttemptNo(int attemptNo) { this.attemptNo = attemptNo; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getDeadlineAt() { return deadlineAt; }
    public void setDeadlineAt(LocalDateTime deadlineAt) { this.deadlineAt = deadlineAt; }

    public LocalDateTime getFinishedAt() { return finishedAt; }
    public void setFinishedAt(LocalDateTime finishedAt) { this.finishedAt = finishedAt; }

    public int getSolvedCount() { return solvedCount; }
    public void setSolvedCount(int solvedCount) { this.solvedCount = solvedCount; }

    public long getTotalTimeSeconds() { return totalTimeSeconds; }
    public void setTotalTimeSeconds(long totalTimeSeconds) { this.totalTimeSeconds = totalTimeSeconds; }

    public List<ContestAttemptProblem> getProblems() { return problems; }
}
