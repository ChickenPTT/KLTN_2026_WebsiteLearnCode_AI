package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.AuthService;
import com.testModule.TestModule.Service.RefreshTokenService;
import com.testModule.TestModule.dto.AuthResponse;
import com.testModule.TestModule.dto.LoginRequest;
import com.testModule.TestModule.dto.RegisterRequest;
import com.testModule.TestModule.dto.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Cookie chi gui kem cac request /api/auth/** (refresh, logout) — khong di theo moi API khac
    private static final String REFRESH_COOKIE = "refresh_token";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final boolean secureCookie;

    public AuthController(
            AuthService authService,
            RefreshTokenService refreshTokenService,
            @Value("${jwt.refresh-cookie-secure}") boolean secureCookie) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.secureCookie = secureCookie;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return withCookie(HttpStatus.CREATED, authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return withCookie(HttpStatus.OK, authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        try {
            return withCookie(HttpStatus.OK, authService.refresh(refreshToken));
        } catch (ResponseStatusException ex) {
            // Token hong/het han -> xoa cookie luon de FE khong gui lai mai
            return ResponseEntity.status(ex.getStatusCode())
                    .header(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString())
                    .build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie("", Duration.ZERO).toString())
                .build();
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(currentUser(authentication).getUser());
    }

    @PostMapping("/me/onboarding")
    public UserResponse completeOnboarding(Authentication authentication) {
        return authService.completeOnboarding(currentUser(authentication).getUser().getId());
    }

    private static AuthUserDetails currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserDetails details)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập.");
        }
        return details;
    }

    private ResponseEntity<AuthResponse> withCookie(HttpStatus status, AuthService.AuthSession session) {
        ResponseCookie cookie = refreshCookie(session.refreshToken(), refreshTokenService.getTtl());
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(session.response());
    }

    private ResponseCookie refreshCookie(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(maxAge)
                .build();
    }
}
