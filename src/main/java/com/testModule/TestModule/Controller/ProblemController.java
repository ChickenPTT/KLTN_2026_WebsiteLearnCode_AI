package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.VerifyResult;
import com.testModule.TestModule.Service.ProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping("/drafts")
    public List<Problem> getDrafts() {
        return problemService.getDraftProblem();
    }

    @GetMapping("/{id}")
    public Problem getProblem(@PathVariable Long id) {
        return problemService.getProblemById(id);
    }

    @PostMapping("/{id}/verify")
    public VerifyResult verifyProblem(@PathVariable Long id) {
        return problemService.verifyProblem(id);
    }

    @PutMapping("/{id}/publish")
    public Problem publishProblem(@PathVariable Long id) {
        return problemService.publishProblem(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}