package com.testModule.TestModule.Service.IF;

import com.testModule.TestModule.Model.AiFeedback;
import com.testModule.TestModule.Model.HistorySubmit;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCaseResult;

import java.util.List;

public interface IHistory {
    public HistorySubmit saveHistory(Long Student, Problem problem, String sourceCode, int languageId,
                                     List<TestCaseResult> testResults, AiFeedback aiFeedback);
    public List<Long> getSolvedProblemIds(Long studentId);
}
