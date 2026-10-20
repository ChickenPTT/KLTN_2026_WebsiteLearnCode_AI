package com.testModule.TestModule.Model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
public class HistorySubmit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    private boolean passed;

    private LocalDateTime submittedAt = LocalDateTime.now();

    // Chi tiet lan nop (ban ghi cu truoc khi them cot co the null)
    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    private Integer languageId;
    private Integer passedCount;
    private Integer totalCount;
    // Thoi gian chay lon nhat (giay) va bo nho lon nhat (KB) trong cac test case
    private Double maxTime;
    private Integer maxMemory;

    // Nhan xet AI (null neu AI loi hoac nop qua /api/submit)
    private String aiErrorType;
    private String aiSeverity;
    @Column(columnDefinition = "TEXT")
    private String aiExplanation;
    @Column(columnDefinition = "TEXT")
    private String aiHint;
    // Danh sach dong nghi loi, dang "3,7,12"
    private String aiSuspectedLines;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public Integer getLanguageId() { return languageId; }
    public void setLanguageId(Integer languageId) { this.languageId = languageId; }

    public Integer getPassedCount() { return passedCount; }
    public void setPassedCount(Integer passedCount) { this.passedCount = passedCount; }

    public Integer getTotalCount() { return totalCount; }
    public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }

    public Double getMaxTime() { return maxTime; }
    public void setMaxTime(Double maxTime) { this.maxTime = maxTime; }

    public Integer getMaxMemory() { return maxMemory; }
    public void setMaxMemory(Integer maxMemory) { this.maxMemory = maxMemory; }

    public String getAiErrorType() { return aiErrorType; }
    public void setAiErrorType(String aiErrorType) { this.aiErrorType = aiErrorType; }

    public String getAiSeverity() { return aiSeverity; }
    public void setAiSeverity(String aiSeverity) { this.aiSeverity = aiSeverity; }

    public String getAiExplanation() { return aiExplanation; }
    public void setAiExplanation(String aiExplanation) { this.aiExplanation = aiExplanation; }

    public String getAiHint() { return aiHint; }
    public void setAiHint(String aiHint) { this.aiHint = aiHint; }

    public String getAiSuspectedLines() { return aiSuspectedLines; }
    public void setAiSuspectedLines(String aiSuspectedLines) { this.aiSuspectedLines = aiSuspectedLines; }
}