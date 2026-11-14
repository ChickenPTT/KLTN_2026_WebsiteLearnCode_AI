package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.EmailVerificationCode;
import com.testModule.TestModule.Repository.EmailVerificationCodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

/*
 * Xac nhan email khi dang ky (logic don gian):
 * - Gui ma 6 so, han 10 phut; gui lai cach nhau it nhat 60 giay.
 * - Nhap sai qua 5 lan -> ma bi huy, phai gui ma moi.
 * - Ma luu dang ma hoa (giong mat khau).
 */
@Service
public class EmailVerificationService {

    public static final int RESEND_SECONDS = 60;
    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final int MAX_ATTEMPTS = 5;

    private final SecureRandom random = new SecureRandom();
    private final EmailVerificationCodeRepository codeRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public EmailVerificationService(EmailVerificationCodeRepository codeRepository,
                                    EmailService emailService,
                                    PasswordEncoder passwordEncoder,
                                    @Value("${auth.email-verification-enabled:true}") boolean enabled) {
        this.codeRepository = codeRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    /** Chi bat buoc nhap ma khi bat tinh nang VA da cau hinh gui email */
    public boolean isRequired() {
        return enabled && emailService.isConfigured();
    }

    @Transactional
    public void sendCode(String email) {
        LocalDateTime now = LocalDateTime.now();
        EmailVerificationCode record = codeRepository.findByEmail(email).orElseGet(() -> new EmailVerificationCode(email));
        if (record.getLastSentAt() != null && record.getLastSentAt().plusSeconds(RESEND_SECONDS).isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Vui lòng đợi " + RESEND_SECONDS + " giây trước khi gửi lại mã.");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        record.setCodeHash(passwordEncoder.encode(code));
        record.setExpiresAt(now.plus(CODE_TTL));
        record.setAttempts(0);
        record.setLastSentAt(now);
        codeRepository.save(record);

        // Gui loi -> exception -> rollback, khong luu ma
        emailService.send(email, "Mã xác nhận đăng ký Mnemonic: " + code, buildEmail(code));
    }

    /*
     * Kiem tra ma. REQUIRES_NEW: so lan nhap sai duoc luu ngay ca khi bao loi
     * (neu chung giao dich voi dang ky thi loi se rollback mat so lan sai).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = ResponseStatusException.class)
    public void verifyAndConsume(String email, String code) {
        EmailVerificationCode record = codeRepository.findByEmail(email).orElse(null);
        if (record == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng bấm gửi mã xác nhận trước.");
        }
        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            codeRepository.delete(record);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác nhận đã hết hạn, vui lòng gửi mã mới.");
        }
        String input = code == null ? "" : code.trim();
        if (!input.matches("\\d{6}") || !passwordEncoder.matches(input, record.getCodeHash())) {
            int attempts = record.getAttempts() + 1;
            if (attempts >= MAX_ATTEMPTS) {
                codeRepository.delete(record);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nhập sai quá nhiều lần, vui lòng gửi mã mới.");
            }
            record.setAttempts(attempts);
            codeRepository.save(record);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mã xác nhận không đúng (còn " + (MAX_ATTEMPTS - attempts) + " lần thử).");
        }
        // Dung -> xoa ma, moi ma chi dung 1 lan
        codeRepository.delete(record);
    }

    private static String buildEmail(String code) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
                  <h2 style="color:#6d28d9;margin-top:0">Xác nhận email đăng ký</h2>
                  <p>Mã xác nhận tài khoản Mnemonic của bạn là:</p>
                  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111827">%s</p>
                  <p>Mã có hiệu lực trong <b>10 phút</b>. Không chia sẻ mã này cho bất kỳ ai.</p>
                  <p style="color:#6b7280;font-size:13px">Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.</p>
                </div>
                """.formatted(code);
    }
}
