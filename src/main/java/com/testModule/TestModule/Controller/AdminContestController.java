package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Service.AdminContestService;
import com.testModule.TestModule.dto.ContestDtos.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Quyen: GET cho ADMIN/TEACHER, ghi chi ADMIN (theo rule /api/admin/** trong SecurityConfig)
@RestController
@RequestMapping("/api/admin/contest/seasons")
public class AdminContestController {

    private final AdminContestService adminContestService;

    public AdminContestController(AdminContestService adminContestService) {
        this.adminContestService = adminContestService;
    }

    @GetMapping
    public List<AdminSeasonView> list() {
        return adminContestService.list();
    }

    @PostMapping
    public AdminSeasonView create(@RequestBody SeasonWriteRequest body) {
        return adminContestService.create(body);
    }

    @PutMapping("/{id}")
    public AdminSeasonView update(@PathVariable Long id, @RequestBody SeasonWriteRequest body) {
        return adminContestService.update(id, body);
    }

    @PutMapping("/{id}/problems")
    public AdminSeasonView setProblems(@PathVariable Long id, @RequestBody SeasonProblemsRequest body) {
        return adminContestService.setProblems(id, body);
    }

    @GetMapping("/{id}")
    public AdminSeasonView get(@PathVariable Long id) {
        return adminContestService.get(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminContestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Kho de cua mua ──
    @GetMapping("/{id}/pool")
    public List<AdminPoolProblem> pool(@PathVariable Long id) {
        return adminContestService.pool(id);
    }

    @PostMapping("/{id}/pool/generate")
    public AdminPoolProblem generate(@PathVariable Long id, @RequestBody PoolGenerateRequest body) {
        return adminContestService.generateIntoPool(id, body);
    }

    @PostMapping("/{id}/pool")
    public AdminPoolProblem addFromBank(@PathVariable Long id, @RequestBody PoolAddRequest body) {
        return adminContestService.addFromBank(id, body);
    }

    @DeleteMapping("/{id}/pool/{problemId}")
    public ResponseEntity<Void> removeFromPool(@PathVariable Long id, @PathVariable Long problemId) {
        adminContestService.removeFromPool(id, problemId);
        return ResponseEntity.noContent().build();
    }
}
