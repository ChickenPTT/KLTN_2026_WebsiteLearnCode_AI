package com.testModule.TestModule.Model; // đổi theo package thật của bạn

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String statement;

    private int languageId;

    private String topic;

    private String level;

    // 1 Problem có nhiều TestCaseEntity  xóa Problem thì xóa luôn test case liên quan
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestCaseEntity> testCases;

    public Problem(){

    }
    public Problem(Long id, String level, String topic, int languageId, String statement,List<TestCaseEntity> testCases ) {
        this.id = id;
        this.level = level;
        this.topic = topic;
        this.languageId = languageId;
        this.statement = statement;
        this.testCases = testCases;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatement() { return statement; }
    public void setStatement(String statement) { this.statement = statement; }

    public int getLanguageId() { return languageId; }
    public void setLanguageId(int languageId) { this.languageId = languageId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public List<TestCaseEntity> getTestCases() { return testCases; }
    public void setTestCases(List<TestCaseEntity> testCases) { this.testCases = testCases; }
}