package com.testModule.TestModule.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_round_results")
public class QuizRoundResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private QuizSession session;

    @Column(nullable = false)
    private Integer roundNumber;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer totalPairs;

    @Column(nullable = false)
    private Long timeSpent;

    @Column(nullable = false)
    private Long timeLimit;

    @Column(nullable = false)
    private Boolean isTimeout = false;

    @OneToMany(mappedBy = "roundResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<QuizWrongTerm> wrongTerms = new java.util.ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuizSession getSession() {
        return session;
    }

    public void setSession(QuizSession session) {
        this.session = session;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Integer roundNumber) {
        this.roundNumber = roundNumber;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalPairs() {
        return totalPairs;
    }

    public void setTotalPairs(Integer totalPairs) {
        this.totalPairs = totalPairs;
    }

    public Long getTimeSpent() {
        return timeSpent;
    }

    public void setTimeSpent(Long timeSpent) {
        this.timeSpent = timeSpent;
    }

    public Long getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Long timeLimit) {
        this.timeLimit = timeLimit;
    }

    public Boolean getIsTimeout() {
        return isTimeout;
    }

    public void setIsTimeout(Boolean isTimeout) {
        this.isTimeout = isTimeout;
    }

    public java.util.List<QuizWrongTerm> getWrongTerms() {
        return wrongTerms;
    }

    public void setWrongTerms(java.util.List<QuizWrongTerm> wrongTerms) {
        this.wrongTerms = wrongTerms;
    }
}
