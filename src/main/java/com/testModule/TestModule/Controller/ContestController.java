package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.AchievementService;
import com.testModule.TestModule.Service.ContestService;
import com.testModule.TestModule.dto.ContestDtos.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contest")
public class ContestController {

    private final ContestService contestService;
    private final AchievementService achievementService;

    public ContestController(ContestService contestService, AchievementService achievementService) {
        this.achievementService = achievementService;
        this.contestService = contestService;
    }

    // Khach cung xem duoc mua giai + bang xep hang; "me" chi co khi da dang nhap
    @GetMapping("/current")
    public CurrentView current(@AuthenticationPrincipal AuthUserDetails user) {
        return contestService.current(userId(user));
    }

    // Thanh tuu ca nhan (tinh tu ket qua thi that)
    @GetMapping("/achievements")
    public List<AchievementView> achievements(@AuthenticationPrincipal AuthUserDetails user) {
        return achievementService.forUser(user.getUser().getId());
    }

    @GetMapping("/seasons")
    public List<SeasonView> seasons() {
        return contestService.seasons();
    }

    @GetMapping("/seasons/{seasonId}/leaderboard")
    public List<LeaderboardRow> leaderboard(@PathVariable Long seasonId, @AuthenticationPrincipal AuthUserDetails user) {
        return contestService.leaderboard(seasonId, userId(user));
    }

    // Dang ky / huy dang ky mua giai hien tai -> tra ve trang thai moi de frontend cap nhat luon
    @PostMapping("/register")
    public CurrentView register(@AuthenticationPrincipal AuthUserDetails user) {
        return contestService.register(user.getUser().getId());
    }

    @DeleteMapping("/register")
    public CurrentView unregister(@AuthenticationPrincipal AuthUserDetails user) {
        return contestService.unregister(user.getUser().getId());
    }

    @PostMapping("/attempts")
    public AttemptView start(@AuthenticationPrincipal AuthUserDetails user) {
        return contestService.start(user.getUser().getId());
    }

    @GetMapping("/attempts/{attemptId}")
    public AttemptView attempt(@PathVariable Long attemptId, @AuthenticationPrincipal AuthUserDetails user) {
        return contestService.getAttempt(user.getUser().getId(), attemptId);
    }

    @PostMapping("/attempts/{attemptId}/run")
    public RunView run(@PathVariable Long attemptId, @RequestBody CodeRequest body,
                       @AuthenticationPrincipal AuthUserDetails user) {
        return contestService.run(user.getUser().getId(), attemptId, body);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public SubmitView submit(@PathVariable Long attemptId, @RequestBody CodeRequest body,
                             @AuthenticationPrincipal AuthUserDetails user) {
        return contestService.submit(user.getUser().getId(), attemptId, body);
    }

    @PostMapping("/attempts/{attemptId}/skip")
    public AttemptView skip(@PathVariable Long attemptId, @AuthenticationPrincipal AuthUserDetails user) {
        return contestService.skip(user.getUser().getId(), attemptId);
    }

    @PostMapping("/attempts/{attemptId}/finish")
    public AttemptView finish(@PathVariable Long attemptId, @AuthenticationPrincipal AuthUserDetails user) {
        return contestService.finish(user.getUser().getId(), attemptId);
    }

    private static Long userId(AuthUserDetails user) {
        return user == null ? null : user.getUser().getId();
    }
}
