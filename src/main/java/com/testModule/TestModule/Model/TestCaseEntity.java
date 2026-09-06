package com.testModule.TestModule.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(columnDefinition = "TEXT")
    private String input;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;


    public TestCaseEntity(){

    }
    public TestCaseEntity(Long id, String input, String expectedOutput, Problem problem) {
        this.id = id;
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.problem = problem;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getInput() {
        return input;
    }
    public void setInput(String input) {
        this.input = input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }
    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public Problem getProblem() {
        return problem; }
    public void setProblem(Problem problem) {
        this.problem = problem; }
}


