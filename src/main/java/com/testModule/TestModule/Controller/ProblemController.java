package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Model.VerifyResult;
import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.ProblemService;
import com.testModule.TestModule.dto.ProblemView;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

//    Danh sach bai da xuat ban cho sinh vien (an loi giai + test an)
    @GetMapping
    public List<ProblemView> getPublishedProblems() {
        return problemService.getPublishedProblems().stream().map(ProblemView::from).toList();
    }

//    Giang vien/admin: toan bo bai (ca nhap), co samples input/output
    @GetMapping("/manage")
    public List<ProblemView> getAllProblems() {
        return problemService.getAllProblems().stream().map(ProblemView::from).toList();
    }

    @GetMapping("/drafts")
    public List<ProblemView> getDrafts() {
        return problemService.getDraftProblem().stream().map(ProblemView::from).toList();
    }

    @GetMapping("/{id}")
    public ProblemView getProblem(@PathVariable Long id, @AuthenticationPrincipal AuthUserDetails user) {
        Problem problem = problemService.getProblemById(id);
        boolean staff = user != null && user.getUser().getRole() != Role.STUDENT;
        if (problem.getStatus() != Problem.Status.PUBLISHED && !staff) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài tập id: " + id);
        }
        return ProblemView.from(problem);
    }

    @PostMapping("/{id}/verify")
    public VerifyResult verifyProblem(@PathVariable Long id) {
        return problemService.verifyProblem(id);
    }

    @PutMapping("/{id}/publish")
    public ProblemView publishProblem(@PathVariable Long id) {
        return ProblemView.from(problemService.publishProblem(id));
    }

    @PutMapping("/{id}/unpublish")
    public ProblemView unpublishProblem(@PathVariable Long id) {
        return ProblemView.from(problemService.unpublishProblem(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }
}
