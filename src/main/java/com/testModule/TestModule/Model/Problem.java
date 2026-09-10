package com.testModule.TestModule.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    public enum Status { DRAFT, PUBLISHED }
    public enum SourceType { MANUAL, AI_GENERATED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String statement;

    private int languageId;
    private String topic;
    private String level;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PUBLISHED;

    @Enumerated(EnumType.STRING)
    private SourceType sourceType = SourceType.MANUAL;

    // THAY THẾ templateGroupId (Long) bằng liên kết Entity thật
    @ManyToOne
    @JoinColumn(name = "template_id")
    private Template template;

    @Column(columnDefinition = "TEXT")
    private String referenceSolution;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestCaseEntity> testCases;

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

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public SourceType getSourceType() { return sourceType; }
    public void setSourceType(SourceType sourceType) { this.sourceType = sourceType; }

    public Template getTemplate() { return template; }
    public void setTemplate(Template template) { this.template = template; }

    public String getReferenceSolution() { return referenceSolution; }
    public void setReferenceSolution(String referenceSolution) { this.referenceSolution = referenceSolution; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<TestCaseEntity> getTestCases() { return testCases; }
    public void setTestCases(List<TestCaseEntity> testCases) { this.testCases = testCases; }
}