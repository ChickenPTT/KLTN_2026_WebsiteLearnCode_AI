package com.testModule.TestModule.Config;

import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.AuditLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
// pom.xml không có starter AOP/aspectj nên không chắc Spring Boot tự bật AOP -> bật tường minh để aspect này chạy.
// proxyTargetClass = true: proxy theo class (CGLIB) để controller inject class cụ thể vẫn hoạt động.
@EnableAspectJAutoProxy(proxyTargetClass = true)
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
        auditLogService.saveLog(user, "CREATE", "Thêm tài khoản người dùng mới");
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

    // ── Template operations ── (tên method thật trong TemplateCommandService: create / update / delete)

    @Around("execution(* com.testModule.TestModule.Service.TemplateCommandService.create(..))")
    public Object logCreateTemplate(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "CREATE", "Tạo Template bài mẫu mới");
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.TemplateCommandService.update(..))")
    public Object logUpdateTemplate(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "UPDATE", "Cập nhật thông tin Template #" + joinPoint.getArgs()[0]);
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.TemplateCommandService.delete(..))")
    public Object logDeleteTemplate(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "DELETE", "Xóa Template bài mẫu #" + joinPoint.getArgs()[0]);
        return result;
    }

    // ── Problem operations ──

    @Around("execution(* com.testModule.TestModule.Service.ProblemGeneratorService.generateVariant(..))")
    public Object logGenerateProblem(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        // generateVariant lưu bài ở trạng thái DRAFT, chưa xuất bản
        auditLogService.saveLog(user, "CREATE", "Sinh bài tập AI mới (bản nháp) từ Template #" + joinPoint.getArgs()[0]);
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.ProblemService.publishProblem(..))")
    public Object logPublishProblem(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "TOGGLE", "Công khai bài tập #" + joinPoint.getArgs()[0]);
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.ProblemService.unpublishProblem(..))")
    public Object logUnpublishProblem(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "TOGGLE", "Ẩn bài tập #" + joinPoint.getArgs()[0] + " (chuyển về bản nháp)");
        return result;
    }

    @Around("execution(* com.testModule.TestModule.Service.ProblemService.deleteProblem(..))")
    public Object logDeleteProblem(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        String user = getCurrentUser();
        auditLogService.saveLog(user, "DELETE", "Xóa bài tập #" + joinPoint.getArgs()[0]);
        return result;
    }
}
