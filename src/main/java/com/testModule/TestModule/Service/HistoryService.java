package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.AiFeedback;
import com.testModule.TestModule.Model.HistorySubmit;
import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.TestCaseResult;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Service.IF.IHistory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class HistoryService implements IHistory {

    private final HistorySubmitRepository historySubmitRepository;

    public HistoryService(HistorySubmitRepository historySubmitRepository) {
        this.historySubmitRepository = historySubmitRepository;
    }

    @Override
    public HistorySubmit saveHistory(Long Student, Problem problem, String sourceCode, int languageId,
                                     List<TestCaseResult> testResults, AiFeedback aiFeedback) {

        boolean allPassed = testResults.stream().allMatch(TestCaseResult::isPassed);

        HistorySubmit history = new HistorySubmit();
        history.setStudentId(Student);
        history.setProblem(problem);
        history.setPassed(allPassed);
        history.setSourceCode(sourceCode);
        history.setLanguageId(languageId);
        history.setPassedCount((int) testResults.stream().filter(TestCaseResult::isPassed).count());
        history.setTotalCount(testResults.size());
        history.setMaxTime(testResults.stream()
                .map(r -> parseTime(r.getTime()))
                .filter(Objects::nonNull)
                .max(Double::compare)
                .orElse(null));
        history.setMaxMemory(testResults.stream()
                .map(TestCaseResult::getMemory)
                .filter(Objects::nonNull)
                .max(Integer::compare)
                .orElse(null));

        if (aiFeedback != null) {
            history.setAiErrorType(aiFeedback.getErrorType());
            history.setAiSeverity(aiFeedback.getSeverity());
            history.setAiExplanation(aiFeedback.getExplanation());
            history.setAiHint(aiFeedback.getHint());
            if (aiFeedback.getSuspectedLines() != null) {
                history.setAiSuspectedLines(aiFeedback.getSuspectedLines().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(",")));
            }
        }
        return historySubmitRepository.save(history);
    }

//    Tranh trung lap danh sach student id da lam
    public List<Long> getSolvedProblemIds(Long studentId) {
        return historySubmitRepository.findByStudentId(studentId).stream()
                .map(h -> h.getProblem().getId())
                .distinct()
                .collect(Collectors.toList());
    }

//    Judge0 tra time dang chuoi giay ("0.012"), co the null khi loi bien dich
    private static Double parseTime(String time) {
        if (time == null || time.isBlank()) return null;
        try {
            return Double.parseDouble(time);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
