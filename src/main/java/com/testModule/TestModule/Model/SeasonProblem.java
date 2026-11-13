package com.testModule.TestModule.Model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "season_problems",
        uniqueConstraints = @UniqueConstraint(name = "uk_season_problem", columnNames = {"season_id", "problem_id"})
)
public class SeasonProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private int position;

    public SeasonProblem() {
    }

    public SeasonProblem(Season season, Problem problem, int position) {
        this.season = season;
        this.problem = problem;
        this.position = position;
    }

    public Long getId() { return id; }

    public Season getSeason() { return season; }

    public Problem getProblem() { return problem; }

    public int getPosition() { return position; }
}
