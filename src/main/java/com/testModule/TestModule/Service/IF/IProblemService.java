package com.testModule.TestModule.Service.IF;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.VerifyResult;

import java.util.List;

public interface IProblemService {
    public List<Problem> getDraftProblem();
    public Problem getProblemById(Long id);
    public VerifyResult verifyProblem(Long id);
    public Problem publishProblem(Long id);
    public void deleteProblem(Long id);


}
