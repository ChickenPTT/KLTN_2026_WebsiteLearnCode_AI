package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCase;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Model.VerifyResult;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Repository.ContestAttemptProblemRepository;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.SeasonProblemRepository;
import com.testModule.TestModule.Service.IF.IProblemService;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class ProblemService implements IProblemService {
    private final ProblemRepository problemRepository;
    private final HistorySubmitRepository historySubmitRepository;
    private final JudgeService judgeService;
    private final SeasonProblemRepository seasonProblemRepository;
    private final ContestAttemptProblemRepository attemptProblemRepository;

    public ProblemService(ProblemRepository problemRepository,
                          HistorySubmitRepository historySubmitRepository,
                          JudgeService judgeService,
                          SeasonProblemRepository seasonProblemRepository,
                          ContestAttemptProblemRepository attemptProblemRepository) {
        this.problemRepository = problemRepository;
        this.historySubmitRepository = historySubmitRepository;
        this.judgeService = judgeService;
        this.seasonProblemRepository = seasonProblemRepository;
        this.attemptProblemRepository = attemptProblemRepository;
    }

    @Override
    public List<Problem> getDraftProblem() {
        return problemRepository.findPracticeByStatus(Problem.Status.DRAFT, Problem.Purpose.CONTEST);
    }

    @Override
    public List<Problem> getPublishedProblems() {
        return problemRepository.findPracticeByStatus(Problem.Status.PUBLISHED, Problem.Purpose.CONTEST);
    }

    @Override
    public List<Problem> getAllProblems() {
        // Bai thi dau duoc quan ly o tab Dau hang, khong hien o trang quan ly de luyen tap
        return problemRepository.findAllPractice(Problem.Purpose.CONTEST);
    }

    @Override
    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài tập id: " + id));

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
    public Problem unpublishProblem(Long id) {
        Problem problem = getProblemById(id);
        problem.setStatus(Problem.Status.DRAFT);
        return problemRepository.save(problem);
    }

    @Override
    @Transactional
    public void deleteProblem(Long id) {
        Problem problem = getProblemById(id);
        if (seasonProblemRepository.existsByProblem_Id(id) || attemptProblemRepository.existsByProblem_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bài này đang thuộc một mùa giải thi đấu, không thể xóa.");
        }
        // Xoa lich su nop bai truoc, neu khong khoa ngoai attempts.problem_id chan viec xoa
        historySubmitRepository.deleteByProblemId(problem.getId());
        problemRepository.delete(problem);
    }
}
