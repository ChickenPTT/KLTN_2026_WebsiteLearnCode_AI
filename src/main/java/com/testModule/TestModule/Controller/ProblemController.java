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

    // GET /api/problems/drafts
    @GetMapping("/drafts")
    public List<Problem> getDrafts() {
        return problemService.getDraftProblem();
    }

    // GET /api/problems/{id}
    @GetMapping("/{id}")
    public Problem getProblem(@PathVariable Long id) {
        return problemService.getProblemById(id);
    }

    // POST /api/problems/{id}/verify
    @PostMapping("/{id}/verify")
    public VerifyResult verifyProblem(@PathVariable Long id) {
        return problemService.verifyProblem(id);
    }

    // PUT /api/problems/{id}/publish
    @PutMapping("/{id}/publish")
    public Problem publishProblem(@PathVariable Long id) {
        return problemService.publishProblem(id);
    }

    // DELETE /api/problems/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}