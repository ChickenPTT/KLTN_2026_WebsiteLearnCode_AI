package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Model.User;
import com.testModule.TestModule.Repository.UserRepository;
import com.testModule.TestModule.Security.JwtTokenProvider;
import com.testModule.TestModule.dto.AuthResponse;
import com.testModule.TestModule.dto.LoginRequest;
import com.testModule.TestModule.dto.RegisterRequest;
import com.testModule.TestModule.dto.UserResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    /** Body tra ve cho FE + refresh token goc (controller dat vao httpOnly cookie, khong nam trong body). */
    public record AuthSession(AuthResponse response, String refreshToken) {
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthSession register(RegisterRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu gửi lên không hợp lệ.");
        }
        String email = normalizeEmail(request.email());
        String fullName = request.fullName() == null ? "" : request.fullName().trim();
        validateEmail(email);
        validatePassword(request.password());
        validateFullName(fullName);
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(fullName);
        user.setRole(Role.STUDENT);
        user.setOnboardingCompleted(false);

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }
        return issue(user);
    }

    @Transactional
    public AuthSession login(LoginRequest request) {
        if (request == null || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email và mật khẩu là bắt buộc.");
        }
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng.");
        }
        return issue(user);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthSession refresh(String refreshToken) {
        RefreshTokenService.Rotation rotation = refreshTokenService.rotate(refreshToken);
        return new AuthSession(toResponse(rotation.user()), rotation.newToken());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    @Transactional
    public UserResponse completeOnboarding(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập."));
        user.setOnboardingCompleted(true);
        return UserResponse.from(user);
    }

    private AuthSession issue(User user) {
        return new AuthSession(toResponse(user), refreshTokenService.create(user));
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                jwtTokenProvider.generateAccessToken(user),
                "Bearer",
                jwtTokenProvider.getExpirationSeconds(),
                UserResponse.from(user)
        );
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

//    Dieu kien cua cac thuoc tinh khi Register
    private static void validateEmail(String email) {
        if (!EMAIL.matcher(email).matches() || email.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ.");
        }
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 32) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải từ 8 đến 32 ký tự.");
        }
        // BCrypt chi nhan toi da 72 byte (ky tu co dau chiem 2-4 byte UTF-8)
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu chứa quá nhiều ký tự đặc biệt.");
        }
    }

    private static void validateFullName(String fullName) {
        if (fullName.isBlank() || fullName.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên không hợp lệ.");
        }
    }
}
