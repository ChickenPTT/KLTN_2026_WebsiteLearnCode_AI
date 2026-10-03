package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.RefreshToken;
import com.testModule.TestModule.Model.User;
import com.testModule.TestModule.Repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    /** Ket qua rotate: user so huu token + refresh token moi (dang goc, de set cookie). */
    public record Rotation(User user, String newToken) {
    }

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final Duration ttl;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${jwt.refresh-token-expiration-ms}") long ttlMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.ttl = Duration.ofMillis(ttlMs);
    }

    public Duration getTtl() {
        return ttl;
    }

    @Transactional
    public String create(User user) {
        // Don rac token cu cua user moi lan cap moi, tranh bang phinh ra
        refreshTokenRepository.deleteExpiredByUserId(user.getId(), Instant.now());

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(Instant.now().plus(ttl));
        refreshTokenRepository.save(token);
        return raw;
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public Rotation rotate(String raw) {
        RefreshToken token = find(raw);
        if (token.isRevoked()) {
            // Token da bi dung roi ma van duoc gui lai -> nghi bi lo, thu hoi het phien cua user
            refreshTokenRepository.revokeAllByUserId(token.getUser().getId());
            throw unauthorized();
        }
        if (token.isExpired()) {
            throw unauthorized();
        }
        token.setRevoked(true);
        User user = token.getUser();
        return new Rotation(user, create(user));
    }

    @Transactional
    public void revoke(String raw) {
        if (raw == null || raw.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hash(raw)).ifPresent(t -> t.setRevoked(true));
    }

    private RefreshToken find(String raw) {
        if (raw == null || raw.isBlank()) {
            throw unauthorized();
        }
        return refreshTokenRepository.findByTokenHash(hash(raw)).orElseThrow(RefreshTokenService::unauthorized);
    }

    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn.");
    }

    private static String hash(String raw) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
