package com.testModule.TestModule.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Ma xac nhan email khi dang ky: moi email chi giu 1 ma moi nhat (gui lai -> ghi de)
@Entity
@Table(name = "email_verification_codes")
public class EmailVerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    // Luu ban ma hoa (giong mat khau), khong luu ma goc
    @Column(nullable = false, length = 100)
    private String codeHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    // So lan nhap sai
    @Column(nullable = false)
    private int attempts;

    // Thoi diem gui gan nhat -> chan gui lai lien tuc
    @Column(nullable = false)
    private LocalDateTime lastSentAt;

    protected EmailVerificationCode() {
    }

    public EmailVerificationCode(String email) {
        this.email = email;
    }

    public Long getId() { return id; }

    public String getEmail() { return email; }

    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public LocalDateTime getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(LocalDateTime lastSentAt) { this.lastSentAt = lastSentAt; }
}
