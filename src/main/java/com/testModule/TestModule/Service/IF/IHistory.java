package com.testModule.TestModule.Service.IF;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseResult;

import java.util.List;

public interface IHistory {
    public void saveHistory(Long Student, Problem problem, List<TestCaseResult> testResults);
    public List<Long> getSolvedProblemIds(Long studentId);
}
