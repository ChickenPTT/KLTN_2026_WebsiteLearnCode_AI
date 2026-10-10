package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.HistorySubmit;
import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Model.User;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Repository.RefreshTokenRepository;
import com.testModule.TestModule.Repository.UserRepository;
import com.testModule.TestModule.dto.UserManagementDTO;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserManagementService {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UserRepository userRepository;
    private final HistorySubmitRepository historySubmitRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(
            UserRepository userRepository,
            HistorySubmitRepository historySubmitRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.historySubmitRepository = historySubmitRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserManagementDTO> getAllUsers(Role roleFilter, String search) {
        String keyword = (search == null || search.isBlank()) ? null : search.trim();
        List<User> users = userRepository.searchUsers(roleFilter, keyword);
        return users.stream()
                .map(user -> UserManagementDTO.from(user, getSolvedCount(user.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserManagementDTO getUserById(Long id) {
        User user = findUser(id);
        return UserManagementDTO.from(user, getSolvedCount(id));
    }

    @Transactional
    public UserManagementDTO createUser(String fullName, String email, String password, Role role) {
        String normalizedEmail = normalizeEmail(email);
        String name = fullName == null ? "" : fullName.trim();
        validateFullName(name);
        validateEmail(normalizedEmail);
        validatePassword(password);
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò không hợp lệ.");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }
        User user = new User();
        user.setFullName(name);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        user.setOnboardingCompleted(false);
        user = userRepository.save(user);
        return UserManagementDTO.from(user, 0);
    }

    @Transactional
    public UserManagementDTO updateUser(Long currentUserId, Long id, String fullName, String email, Role role) {
        User user = findUser(id);
        String normalizedEmail = normalizeEmail(email);
        String name = fullName == null ? "" : fullName.trim();
        validateFullName(name);
        validateEmail(normalizedEmail);
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò không hợp lệ.");
        }
        if (Objects.equals(currentUserId, id) && role != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự hạ quyền tài khoản quản trị của chính mình.");
        }
        if (!user.getEmail().equals(normalizedEmail) && userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }

        user.setFullName(name);
        user.setEmail(normalizedEmail);
        user.setRole(role);
        user = userRepository.save(user);
        return UserManagementDTO.from(user, getSolvedCount(id));
    }

    @Transactional
    public UserManagementDTO toggleUserStatus(Long currentUserId, Long id) {
        if (Objects.equals(currentUserId, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự khóa tài khoản của chính mình.");
        }
        User user = findUser(id);
        user.setActive(!user.isActive());
        user = userRepository.save(user);
        if (!user.isActive()) {
            // Khoa tai khoan -> thu hoi moi phien dang nhap dang mo
            refreshTokenRepository.revokeAllByUserId(id);
        }
        return UserManagementDTO.from(user, getSolvedCount(id));
    }

    @Transactional
    public void deleteUser(Long currentUserId, Long id) {
        if (Objects.equals(currentUserId, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự xóa tài khoản của chính mình.");
        }
        if (!userRepository.existsById(id)) {
            throw notFound();
        }
        historySubmitRepository.deleteByStudentId(id);
        refreshTokenRepository.deleteByUserId(id);
        userRepository.deleteById(id);
    }

    private User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(UserManagementService::notFound);
    }

    private int getSolvedCount(Long userId) {
        return (int) historySubmitRepository.findByStudentId(userId).stream()
                .filter(HistorySubmit::isPassed)
                .map(h -> h.getProblem().getId())
                .distinct()
                .count();
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng.");
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static void validateEmail(String email) {
        if (!EMAIL.matcher(email).matches() || email.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ.");
        }
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 32) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải từ 8 đến 32 ký tự.");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu chứa quá nhiều ký tự đặc biệt.");
        }
    }

    private static void validateFullName(String fullName) {
        if (fullName.length() < 2 || fullName.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên không hợp lệ.");
        }
    }
}
