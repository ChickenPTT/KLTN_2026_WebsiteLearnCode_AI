package com.testModule.TestModule.Config;

import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.AuditLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditLogAspect {

    private final AuditLogService auditLogService;

    public AuditLogAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthUserDetails userDetails) {
            return userDetails.getUser().getFullName();
        }
        return "System";
    }

    // ── User operations ──

    @Around("execution(* com.testModule.TestModule.Service.UserManagementService.createUser(..))")
    public Object logCreateUser(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "Create", "Thêm tài khoản người dùng mới");
        return result;
    }
    @Around("execution(* com.testModule.TestModule.Service.UserManagementService.updateUser(..))")
    public Object logUpdateUser(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "UPDATE", "Cập nhật thông tin tài khoản người dùng");
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.UserManagementService.deleteUser(..))")
    public Object logDeleteUser(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "DELETE", "Xóa tài khoản người dùng");
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.UserManagementService.toggleUserStatus(..))")
    public Object logToggleUser(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "TOGGLE", "Thay đổi trạng thái tài khoản người dùng");
        return result;
    }

    // ── Template operations ──

    @Around("execution(* com.testModule.TestModule.Service.TemplateCommandService.createTemplate(..))")
    public Object logCreateTemplate(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "CREATE", "Tạo Template bài mẫu mới");
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.TemplateCommandService.updateTemplate(..))")
    public Object logUpdateTemplate(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "UPDATE", "Cập nhật thông tin Template");
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.TemplateCommandService.deleteTemplate(..))")
    public Object logDeleteTemplate(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "DELETE", "Xóa Template bài mẫu");
        return result;
    }

    // ── Problem operations ──

    @Around("execution(* com.testModule.TestModule.Service.ProblemGeneratorService.generateVariant(..))")
    public Object logGenerateProblem(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "CREATE", "Xuất bản bài tập AI sinh tự động");
        return result;
    }
}
