package com.testModule.TestModule.Model;

import java.util.List;

public class VerifyResult {
    private Boolean allPassed;
    private List<TestCaseResult> results;

    public VerifyResult(Boolean allPassed, List<TestCaseResult> results) {
        this.allPassed = allPassed;
        this.results = results;
    }

    public Boolean isAllPassed() {
        return allPassed;
    }

    public void setAllPassed(Boolean allPassed) {
        this.allPassed = allPassed;
    }

    public List<TestCaseResult> getResults() {
        return results;
    }

    public void setResults(List<TestCaseResult> results) {
        this.results = results;
    }
}
