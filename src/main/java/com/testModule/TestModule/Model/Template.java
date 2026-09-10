package com.testModule.TestModule.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "templates")
public class Template {

    public enum GeneratorType {
        TWO_INTEGERS,
        INTEGER_ARRAY,
        STRING_BASIC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    private String level;

    @Enumerated(EnumType.STRING)
    private GeneratorType generatorType;


    private Integer minN;
    private Integer maxN;
    private Integer minValue;
    private Integer maxValue;

    @Column(columnDefinition = "TEXT")
    private String statementPattern; // đề bài gốc, AI sẽ paraphrase từ đây

    @Column(columnDefinition = "TEXT")
    private String referenceSolutionCode; // code giải mẫu, cố định cho cả template

    private int languageId;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public GeneratorType getGeneratorType() {
        return generatorType;
    }

    public void setGeneratorType(GeneratorType generatorType) {
        this.generatorType = generatorType;
    }

    public Integer getMinN() {
        return minN;
    }

    public void setMinN(Integer minN) {
        this.minN = minN;
    }

    public Integer getMaxN() {
        return maxN;
    }

    public void setMaxN(Integer maxN) {
        this.maxN = maxN;
    }

    public Integer getMinValue() {
        return minValue;
    }

    public void setMinValue(Integer minValue) {
        this.minValue = minValue;
    }

    public Integer getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Integer maxValue) {
        this.maxValue = maxValue;
    }

    public String getStatementPattern() {
        return statementPattern;
    }

    public void setStatementPattern(String statementPattern) {
        this.statementPattern = statementPattern;
    }

    public String getReferenceSolutionCode() {
        return referenceSolutionCode;
    }

    public void setReferenceSolutionCode(String referenceSolutionCode) {
        this.referenceSolutionCode = referenceSolutionCode;
    }

    public int getLanguageId() {
        return languageId;
    }

    public void setLanguageId(int languageId) {
        this.languageId = languageId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}