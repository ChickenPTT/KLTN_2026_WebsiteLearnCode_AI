package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Model.VerifyResult;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Service.IF.IProblemService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class ProblemService implements IProblemService {
    private final ProblemRepository problemRepository;
    private final JudgeService judgeService;

    public ProblemService(ProblemRepository problemRepository, JudgeService judgeService) {
        this.problemRepository = problemRepository;
        this.judgeService = judgeService;
    }

    @Override
    public List<Problem> getDraftProblem() {
        return problemRepository.findByStatus(Problem.Status.DRAFT);
    }

    @Override
    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy problem id: " + id));

    }

    @Override
    public VerifyResult verifyProblem(Long id) {
        Problem problem = getProblemById(id);
        List<TestCase> testCases = problem.getTestCases().stream()
                .map(tc -> new TestCase(tc.getInput(), tc.getExpectedOutput()))
                .collect(Collectors.toList());
        List<TestCaseResult> results = judgeService.runAllTestCases(
                problem.getReferenceSolution(),
                problem.getLanguageId(),
                testCases);

        Boolean allPass = results.stream().allMatch(TestCaseResult::isPassed);
        return new VerifyResult(allPass, results);

    }

    @Override
    public Problem publishProblem(Long id) {
        Problem problem = getProblemById(id);
        problem.setStatus(Problem.Status.PUBLISHED);
        return problemRepository.save(problem);    }

    @Override
    public void deleteProblem(Long id) {
        problemRepository.deleteById(id);
    }
}
