package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.ContestAttempt;
import com.testModule.TestModule.Model.Season;
import com.testModule.TestModule.Repository.ContestAttemptRepository;
import com.testModule.TestModule.dto.ContestDtos.AchievementView;
import com.testModule.TestModule.dto.ContestDtos.LeaderboardRow;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Predicate;

/*
 * Thanh tuu ca nhan: tinh truc tiep tu ket qua thi that (khong luu bang rieng),
 * nen luon khop voi lich su thi va bang xep hang.
 */
@Service
public class AchievementService {

    private static final int FULL_SOLVE = AdminContestService.PROBLEMS_PER_SEASON;
    private static final long SPEED_LIMIT_SECONDS = 30 * 60;

    private final ContestAttemptRepository attemptRepository;
    private final ContestService contestService;

    public AchievementService(ContestAttemptRepository attemptRepository, ContestService contestService) {
        this.attemptRepository = attemptRepository;
        this.contestService = contestService;
    }

    @Transactional
    public List<AchievementView> forUser(Long userId) {
        List<ContestAttempt> finished = attemptRepository.findByUserId(userId).stream()
                .filter(a -> a.getStatus() == ContestAttempt.Status.FINISHED)
                .sorted(Comparator.comparing(ContestAttempt::getFinishedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        // Thu hang cuoi cung o cac mua da ket thuc
        LocalDateTime now = LocalDateTime.now();
        Map<Long, Season> endedSeasons = new LinkedHashMap<>();
        finished.forEach(a -> {
            Season s = a.getSeason();
            if (s.statusAt(now) == Season.Status.ENDED) endedSeasons.putIfAbsent(s.getId(), s);
        });
        LocalDateTime top3Date = null;
        LocalDateTime championDate = null;
        for (Season s : endedSeasons.values()) {
            Integer rank = contestService.leaderboard(s.getId(), userId).stream()
                    .filter(LeaderboardRow::me).map(LeaderboardRow::rank).findFirst().orElse(null);
            if (rank != null && rank <= 3 && top3Date == null) top3Date = s.getEndAt();
            if (rank != null && rank == 1 && championDate == null) championDate = s.getEndAt();
        }

        // Ngay tham gia mua thu 3
        LocalDateTime thirdSeasonDate = null;
        Set<Long> seen = new HashSet<>();
        for (ContestAttempt a : finished) {
            if (seen.add(a.getSeason().getId()) && seen.size() == 3) {
                thirdSeasonDate = a.getFinishedAt();
                break;
            }
        }

        List<AchievementView> list = new ArrayList<>();
        list.add(view("first-attempt", "Khởi đầu", "Hoàn thành lượt thi đầu tiên", "rocket", "common",
                firstDate(finished, a -> true)));
        list.add(view("three-seasons", "Bền bỉ", "Tham gia 3 mùa giải khác nhau", "brain", "common", thirdSeasonDate));
        list.add(view("first-try-perfect", "Một phát ăn ngay", "Đúng cả " + FULL_SOLVE + " bài ngay lượt đầu tiên của một mùa",
                "zap", "rare", firstDate(finished, a -> a.getAttemptNo() == 1 && a.getSolvedCount() >= FULL_SOLVE)));
        list.add(view("speed", "Tốc độ", "Đúng cả " + FULL_SOLVE + " bài với tổng thời gian không quá 30 phút",
                "flame", "rare", firstDate(finished, a -> a.getSolvedCount() >= FULL_SOLVE && a.getTotalTimeSeconds() <= SPEED_LIMIT_SECONDS)));
        list.add(view("perfect", "Hoàn hảo", "Đúng cả " + FULL_SOLVE + " bài trong một lượt thi",
                "crown", "epic", firstDate(finished, a -> a.getSolvedCount() >= FULL_SOLVE)));
        list.add(view("top3", "Top 3", "Kết thúc một mùa giải trong top 3", "trophy", "epic", top3Date));
        list.add(view("champion", "Vô địch", "Đứng hạng nhất khi mùa giải kết thúc", "crown", "legendary", championDate));
        return list;
    }

    private static LocalDateTime firstDate(List<ContestAttempt> finished, Predicate<ContestAttempt> condition) {
        return finished.stream().filter(condition).map(ContestAttempt::getFinishedAt).filter(Objects::nonNull)
                .findFirst().orElse(null);
    }

    private static AchievementView view(String id, String title, String desc, String icon, String rarity, LocalDateTime date) {
        return new AchievementView(id, title, desc, icon, rarity, date != null, date);
    }
}
