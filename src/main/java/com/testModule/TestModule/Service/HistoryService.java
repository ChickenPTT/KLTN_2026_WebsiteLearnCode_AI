package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.HistorySubmit;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Service.IF.IHistory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoryService implements IHistory {

    private final HistorySubmitRepository historySubmitRepository;

    public HistoryService(HistorySubmitRepository historySubmitRepository) {
        this.historySubmitRepository = historySubmitRepository;
    }

    @Override
    public void saveHistory(Long Student, Problem problem, List<TestCaseResult> testResults) {

        boolean allPassed = testResults.stream().allMatch(TestCaseResult::isPassed);

        HistorySubmit history = new HistorySubmit();
        history.setStudentId(Student);
        history.setProblem(problem);
        history.setPassed(allPassed);
        historySubmitRepository.save(history);
    }

//    Tranh trung lap danh sach student id da lam
    public List<Long> getSolvedProblemIds(Long studentId) {
        return historySubmitRepository.findByStudentId(studentId).stream()
                .map(h -> h.getProblem().getId())
                .distinct()
                .collect(Collectors.toList());
    }
}
