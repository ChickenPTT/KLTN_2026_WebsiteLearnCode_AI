package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.SelfAssessedLevel;
import com.testModule.TestModule.Model.User;
import com.testModule.TestModule.Model.UserSelfAssessment;
import com.testModule.TestModule.Repository.HistorySubmitRepository;
import com.testModule.TestModule.Repository.UserRepository;
import com.testModule.TestModule.Repository.UserSelfAssessmentRepository;
import com.testModule.TestModule.dto.SelfAssessmentItem;
import com.testModule.TestModule.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Luu/doc trinh do hoc vien tu danh gia theo chu de.
 * Luu xong dong thoi danh dau onboardingCompleted = true (cung transaction).
 */
@Service
public class SelfAssessmentService {

    private static final int MAX_ITEMS = 50;
    private static final int MAX_TOPIC_LENGTH = 100;
    /**
     * Đủ số bài khác nhau này trong một chủ đề thì năng lực tính hoàn toàn từ bài thật
     * (khớp PRIOR_FADE_COUNT ở frontend/src/lib/progress.ts) -> khóa tự đánh giá chủ đề đó.
     */
    public static final int LOCK_AFTER_PROBLEMS = 5;

    private final UserSelfAssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final HistorySubmitRepository historyRepository;

    public SelfAssessmentService(UserSelfAssessmentRepository assessmentRepository,
                                 UserRepository userRepository,
                                 HistorySubmitRepository historyRepository) {
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    /** Các chủ đề đã làm đủ {@link #LOCK_AFTER_PROBLEMS} bài khác nhau -> không được tự đánh giá lại. */
    @Transactional(readOnly = true)
    public List<String> lockedTopics(Long userId) {
        List<String> result = new ArrayList<>();
        for (Object[] row : historyRepository.countDistinctProblemsByTopic(userId)) {
            String topic = row[0] == null ? "" : row[0].toString().trim();
            long count = ((Number) row[1]).longValue();
            if (!topic.isEmpty() && count >= LOCK_AFTER_PROBLEMS) {
                result.add(topic);
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<SelfAssessmentItem> getForUser(Long userId) {
        return assessmentRepository.findByUserId(userId).stream()
                .map(a -> new SelfAssessmentItem(a.getTopic(), a.getLevel().name().toLowerCase(Locale.ROOT)))
                .toList();
    }

    /** Ghi de toan bo danh gia cua user bang danh sach moi. */
    @Transactional
    public UserResponse save(Long userId, List<SelfAssessmentItem> items) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập."));

        Map<String, SelfAssessmentItem> incoming = validate(items);

        Map<String, UserSelfAssessment> existing = new LinkedHashMap<>();
        for (UserSelfAssessment a : assessmentRepository.findByUserId(userId)) {
            existing.put(key(a.getTopic()), a);
        }

        // Chủ đề đã khóa: giữ nguyên bản ghi cũ (không sửa, không xóa, không tạo mới) dù client gửi gì
        Set<String> locked = new HashSet<>();
        for (String t : lockedTopics(userId)) {
            locked.add(key(t));
        }
        locked.forEach(existing::remove);
        incoming.keySet().removeIf(locked::contains);

        List<UserSelfAssessment> toSave = new ArrayList<>();
        incoming.forEach((k, item) -> {
            UserSelfAssessment row = existing.remove(k);
            if (row == null) {
                row = new UserSelfAssessment();
                row.setUser(user);
            }
            row.setTopic(item.topic());
            row.setLevel(SelfAssessedLevel.valueOf(item.level().toUpperCase(Locale.ROOT)));
            toSave.add(row);
        });

        if (!existing.isEmpty()) {
            assessmentRepository.deleteAll(existing.values());
        }
        assessmentRepository.saveAll(toSave);

        user.setOnboardingCompleted(true);
        return UserResponse.from(user);
    }

    private static Map<String, SelfAssessmentItem> validate(List<SelfAssessmentItem> items) {
        if (items == null || items.isEmpty()) {
            throw badRequest("Vui lòng đánh giá ít nhất một chủ đề.");
        }
        if (items.size() > MAX_ITEMS) {
            throw badRequest("Số chủ đề vượt quá giới hạn.");
        }
        Map<String, SelfAssessmentItem> result = new LinkedHashMap<>();
        for (SelfAssessmentItem item : items) {
            if (item == null) {
                throw badRequest("Dữ liệu đánh giá không hợp lệ.");
            }
            String topic = item.topic() == null ? "" : item.topic().trim().replaceAll("\\s+", " ");
            if (topic.isEmpty() || topic.length() > MAX_TOPIC_LENGTH) {
                throw badRequest("Tên chủ đề không hợp lệ.");
            }
            String level = item.level() == null ? "" : item.level().trim().toUpperCase(Locale.ROOT);
            try {
                SelfAssessedLevel.valueOf(level);
            } catch (IllegalArgumentException ex) {
                throw badRequest("Mức trình độ không hợp lệ: " + item.level());
            }
            // Trung chu de -> lay gia tri cuoi
            result.put(key(topic), new SelfAssessmentItem(topic, level.toLowerCase(Locale.ROOT)));
        }
        return result;
    }

    private static String key(String topic) {
        return topic.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
