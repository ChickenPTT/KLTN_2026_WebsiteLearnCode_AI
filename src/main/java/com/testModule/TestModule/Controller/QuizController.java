package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.QuizSession;
import com.testModule.TestModule.Service.QuizService;
import com.testModule.TestModule.dto.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flashcard/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/start")
    public RoundResponse startQuiz(@RequestBody StartQuizRequest request) {
        return quizService.startQuiz(request);
    }

    @PostMapping("/pair")
    public PairResult submitPair(@RequestBody SubmitPairRequest request) {
        return quizService.submitPair(request);
    }

    @GetMapping("/next-round/{sessionId}")
    public RoundResponse getNextRound(@PathVariable Long sessionId) {
        return quizService.getNextRound(sessionId);
    }

    @PostMapping("/retry-wrong/{sessionId}")
    public RoundResponse retryWrong(@PathVariable Long sessionId) {
        return quizService.retryWrong(sessionId);
    }

    @GetMapping("/result/{sessionId}")
    public QuizResultResponse getQuizResult(@PathVariable Long sessionId) {
        return quizService.getQuizResult(sessionId);
    }

    @GetMapping("/history")
    public List<QuizSessionDto> getQuizHistory() {
        return quizService.getQuizHistory();
    }
}
