package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.AdminDashboardService;
import com.testModule.TestModule.Service.UserManagementService;
import com.testModule.TestModule.dto.AdminDashboardStats;
import com.testModule.TestModule.dto.AuditLogDto;
import com.testModule.TestModule.dto.UserManagementDTO;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminDashboardService adminDashboardService;
    private final UserManagementService userManagementService;
    private final com.testModule.TestModule.Service.AuditLogService auditLogService;

    public AdminController(
            AdminDashboardService adminDashboardService,
            UserManagementService userManagementService,
            com.testModule.TestModule.Service.AuditLogService auditLogService
    ) {
        this.adminDashboardService = adminDashboardService;
        this.userManagementService = userManagementService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public AdminDashboardStats getDashboardStats(@AuthenticationPrincipal AuthUserDetails user) {
        return adminDashboardService.getDashboardStats();
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<UserManagementDTO> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String search
    ) {
        return userManagementService.getAllUsers(role, search);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public UserManagementDTO getUserById(@PathVariable Long id) {
        return userManagementService.getUserById(id);
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public UserManagementDTO createUser(@RequestBody CreateUserRequest request) {
        return userManagementService.createUser(request.fullName(), request.email(), request.password(), request.role());
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserManagementDTO updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal AuthUserDetails currentUser
    ) {
        return userManagementService.updateUser(currentUser.getUser().getId(), id, request.fullName(), request.email(), request.role());
    }

    @PatchMapping("/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public UserManagementDTO toggleUserStatus(@PathVariable Long id, @AuthenticationPrincipal AuthUserDetails currentUser) {
        return userManagementService.toggleUserStatus(currentUser.getUser().getId(), id);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id, @AuthenticationPrincipal AuthUserDetails currentUser) {
        userManagementService.deleteUser(currentUser.getUser().getId(), id);
    }

//    @GetMapping("/audit-logs")
//    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
//    public List<AuditLogDto> getAuditLogs(
//            @RequestParam(required = false) String action
//    ) {
//        if (action != null && !action.isEmpty()) {
//            return auditLogService.getLogsByAction(action).stream()
//                .map(AuditLogDto::from)
//                .toList();
//        }
//        return auditLogService.getAllLogs().stream()
//            .map(AuditLogDto::from)
//            .toList();
//    }

    public record CreateUserRequest(String fullName, String email, String password, Role role) {}
    public record UpdateUserRequest(String fullName, String email, Role role) {}
}
