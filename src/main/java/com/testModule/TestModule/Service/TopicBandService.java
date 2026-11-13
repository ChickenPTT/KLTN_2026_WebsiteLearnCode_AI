package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.User;
import com.testModule.TestModule.Model.UserTopicBand;
import com.testModule.TestModule.Repository.UserRepository;
import com.testModule.TestModule.Repository.UserTopicBandRepository;
import com.testModule.TestModule.dto.TopicBandItem;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@Service
public class TopicBandService {

    private static final int MAX_ITEMS = 100;
    private static final int MAX_TOPIC_LENGTH = 100;

    private final UserTopicBandRepository bandRepository;
    private final UserRepository userRepository;

    public TopicBandService(UserTopicBandRepository bandRepository, UserRepository userRepository) {
        this.bandRepository = bandRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TopicBandItem> getForUser(Long userId) {
        return bandRepository.findByUserId(userId).stream()
                .map(b -> new TopicBandItem(b.getTopic(), b.getBandIndex()))
                .toList();
    }

    @Transactional
    public List<TopicBandItem> save(Long userId, List<TopicBandItem> items) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập."));
        if (items == null) {
            throw badRequest("Dữ liệu không hợp lệ.");
        }
        if (items.size() > MAX_ITEMS) {
            throw badRequest("Số chủ đề vượt quá giới hạn.");
        }

        Map<String, TopicBandItem> incoming = new LinkedHashMap<>();
        for (TopicBandItem item : items) {
            if (item == null || item.bandIndex() == null || item.bandIndex() < 0 || item.bandIndex() > 4) {
                throw badRequest("Band không hợp lệ.");
            }
            String topic = item.topic() == null ? "" : item.topic().trim().replaceAll("\\s+", " ");
            if (topic.isEmpty() || topic.length() > MAX_TOPIC_LENGTH) {
                throw badRequest("Tên chủ đề không hợp lệ.");
            }
            incoming.put(key(topic), new TopicBandItem(topic, item.bandIndex()));
        }

        Map<String, UserTopicBand> existing = new HashMap<>();
        for (UserTopicBand b : bandRepository.findByUserId(userId)) {
            existing.put(key(b.getTopic()), b);
        }

        List<UserTopicBand> toSave = new ArrayList<>();
        incoming.forEach((k, item) -> {
            UserTopicBand row = existing.get(k);
            if (row == null) {
                row = new UserTopicBand();
                row.setUser(user);
                row.setTopic(item.topic());
            }
            row.setBandIndex(item.bandIndex());
            toSave.add(row);
        });
        bandRepository.saveAll(toSave);
        return getForUser(userId);
    }

    private static String key(String topic) {
        return topic.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
