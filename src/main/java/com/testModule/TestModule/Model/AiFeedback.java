package com.testModule.TestModule.Model;

import java.util.List;
import java.util.Map;

public class AiFeedback {
    private String errorType;
    private List<Integer> suspectedLines;
    private String explanation;
    private String hint;
    private String severity;

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public List<Integer> getSuspectedLines() {
        return suspectedLines;
    }

    public void setSuspectedLines(List<Integer> suspectedLines) {
        this.suspectedLines = suspectedLines;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getHint() {
        return hint;
    }

    public void setHint(String hint) {
        this.hint = hint;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}