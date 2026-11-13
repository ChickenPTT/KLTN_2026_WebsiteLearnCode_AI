package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.*;
import com.testModule.TestModule.Repository.ContestAttemptRepository;
import com.testModule.TestModule.Repository.SeasonRegistrationRepository;
import com.testModule.TestModule.Repository.SeasonRepository;
import com.testModule.TestModule.Repository.UserRepository;
import com.testModule.TestModule.dto.ContestDtos.*;
import com.testModule.TestModule.dto.ProblemView;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/*
 * Luat thi dau (thong nhat cua nhom):
 * - Moi mua co 4 bai, ai cung lam cung 4 bai; 1 luot = ca 4 bai; toi da maxAttempts (3) luot.
 * - Moi luot xao thu tu bai, chi hien tung bai; nop lai khong gioi han; bo qua = sai, khong quay lai.
 * - Gioi han timeLimitMinutes (90) phut/luot; het gio bai chua xong tinh sai. Gio lay tren server.
 * - Xep hang theo luot tot nhat: so bai dung (nhieu) > so luot da dung (it) > tong thoi gian (it).
 * - Bai thi khong luu vao lich su luyen tap -> khong anh huong diem nang luc.
 */
@Service
public class ContestService {

    private static final Set<Integer> ALLOWED_LANGUAGES = Set.of(50, 54, 62, 71);
    private static final int MAX_SOURCE_LENGTH = 50_000;

    private final SeasonRepository seasonRepository;
    private final ContestAttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final JudgeService judgeService;
    private final SeasonRegistrationRepository registrationRepository;

    public ContestService(SeasonRepository seasonRepository,
                          ContestAttemptRepository attemptRepository,
                          UserRepository userRepository,
                          JudgeService judgeService,
                          SeasonRegistrationRepository registrationRepository) {
        this.seasonRepository = seasonRepository;
        this.attemptRepository = attemptRepository;
        this.userRepository = userRepository;
        this.judgeService = judgeService;
        this.registrationRepository = registrationRepository;
    }

//   đọc thông tin mùa giải
    @Transactional
    public CurrentView current(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        Season season = pickCurrentSeason(now);
        if (season == null) {
            return new CurrentView(null, null, now);
        }
        MyStanding me = userId == null ? null : standing(season, userId, now);
        return new CurrentView(toSeasonView(season, now), me, now);
    }

    @Transactional(readOnly = true)
    public List<SeasonView> seasons() {
        LocalDateTime now = LocalDateTime.now();
        return seasonRepository.findAllByOrderByStartAtDesc().stream()
                .map(s -> toSeasonView(s, now))
                .toList();
    }


    @Transactional
    public List<LeaderboardRow> leaderboard(Long seasonId, Long userId) {
        Season season = findSeason(seasonId);
        return computeLeaderboard(season, userId, LocalDateTime.now());
    }


    // Đăng ký mùa giải hiện tại (sắp diễn ra hoặc đang diễn ra)
    @Transactional
    public CurrentView register(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        Season season = pickCurrentSeason(now);
        if (season == null || season.statusAt(now) == Season.Status.ENDED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hiện không có mùa giải nào mở đăng ký.");
        }
        // Đã đăng ký rồi -> không làm gì, trả về trạng thái hiện tại
        if (!registrationRepository.existsByUserIdAndSeasonId(userId, season.getId())) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."));
            try {
                registrationRepository.saveAndFlush(new SeasonRegistration(user, season));
            } catch (DataIntegrityViolationException e) {
                // Bấm "Đăng ký" 2 lần cùng lúc -> ràng buộc unique chặn bản ghi trùng
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đăng ký rồi, vui lòng tải lại trang.");
            }
        }
        return current(userId);
    }

    // Hủy đăng ký: chỉ được hủy khi chưa thi lượt nào
    @Transactional
    public CurrentView unregister(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        Season season = pickCurrentSeason(now);
        if (season == null || season.statusAt(now) == Season.Status.ENDED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mùa giải đã kết thúc.");
        }
        if (!attemptRepository.findByUserAndSeason(userId, season.getId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã thi trong mùa này, không thể hủy đăng ký.");
        }
        registrationRepository.findByUserIdAndSeasonId(userId, season.getId())
                .ifPresent(registrationRepository::delete);
        return current(userId);
    }

    //Start cuộc thi
    @Transactional
    public AttemptView start(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        Season season = pickCurrentSeason(now);
        if (season == null || season.statusAt(now) != Season.Status.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hiện không có mùa giải nào đang diễn ra.");
        }
        if (season.getProblems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mùa giải chưa có đề thi.");
        }
        List<ContestAttempt> mine = attemptRepository.findByUserAndSeason(userId, season.getId());
        if (!isRegistered(userId, season, mine)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký mùa giải này.");
        }
        mine.forEach(a -> expireIfNeeded(a, now));
        Optional<ContestAttempt> running = mine.stream()
                .filter(a -> a.getStatus() == ContestAttempt.Status.IN_PROGRESS)
                .findFirst();
        if (running.isPresent()) {
            return toAttemptView(running.get(), now);
        }
        if (mine.size() >= season.getMaxAttempts()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bạn đã dùng hết " + season.getMaxAttempts() + " lượt thi của mùa giải này.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."));

        ContestAttempt attempt = new ContestAttempt();
        attempt.setUser(user);
        attempt.setSeason(season);
        attempt.setAttemptNo(mine.size() + 1);
        attempt.setStartedAt(now);
        // Han nop: 90 phut, nhung khong vuot qua gio ket thuc mua
        LocalDateTime deadline = now.plusMinutes(season.getTimeLimitMinutes());
        attempt.setDeadlineAt(deadline.isAfter(season.getEndAt()) ? season.getEndAt() : deadline);

        // Xao thu tu de bai rieng cho luot nay
        List<Problem> shuffled = season.getProblems().stream()
                .map(SeasonProblem::getProblem)
                .collect(Collectors.toCollection(ArrayList::new));
        Collections.shuffle(shuffled);
        for (int i = 0; i < shuffled.size(); i++) {
            ContestAttemptProblem slot = new ContestAttemptProblem(attempt, shuffled.get(i), i);
            if (i == 0) {
                slot.setStatus(ContestAttemptProblem.Status.OPEN);
                slot.setOpenedAt(now);
            }
            attempt.getProblems().add(slot);
        }

        try {
            attemptRepository.saveAndFlush(attempt);
        } catch (DataIntegrityViolationException e) {
            // Bam "Bat dau" 2 lan cung luc -> rang buoc unique chan ban ghi trung
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lượt thi đã được tạo, vui lòng tải lại trang.");
        }
        return toAttemptView(attempt, now);
    }

    @Transactional
    public AttemptView getAttempt(Long userId, Long attemptId) {
        LocalDateTime now = LocalDateTime.now();
        ContestAttempt attempt = findOwnAttempt(userId, attemptId);
        expireIfNeeded(attempt, now);
        return toAttemptView(attempt, now);
    }

    // Chay thu voi test case mau (cong khai), khong tinh lan nop
    @Transactional
    public RunView run(Long userId, Long attemptId, CodeRequest body) {
        LocalDateTime now = LocalDateTime.now();
        ContestAttempt attempt = findOwnAttempt(userId, attemptId);
        ContestAttemptProblem slot = requireOpenSlot(attempt, now);
        Problem problem = slot.getProblem();
        List<TestCaseResult> results = judge(body, problem, ProblemView.SAMPLE_COUNT);
        return new RunView(results.stream().allMatch(TestCaseResult::isPassed), results);
    }

    @Transactional
    public SubmitView submit(Long userId, Long attemptId, CodeRequest body) {
        LocalDateTime now = LocalDateTime.now();
        ContestAttempt attempt = findOwnAttempt(userId, attemptId);
        ContestAttemptProblem slot = requireOpenSlot(attempt, now);
        Problem problem = slot.getProblem();

        List<TestCaseResult> results = judge(body, problem, Integer.MAX_VALUE);
        LocalDateTime judgedAt = LocalDateTime.now();
        slot.setSubmitCount(slot.getSubmitCount() + 1);

        boolean passed = !results.isEmpty() && results.stream().allMatch(TestCaseResult::isPassed);
        // Cham xong sau han nop (Judge0 cham lau) -> khong cong nhan
        if (passed && !judgedAt.isAfter(attempt.getDeadlineAt())) {
            slot.setStatus(ContestAttemptProblem.Status.SOLVED);
            slot.setSolvedAt(judgedAt);
            advance(attempt, judgedAt);
        } else {
            expireIfNeeded(attempt, judgedAt);
        }

        int passedCount = (int) results.stream().filter(TestCaseResult::isPassed).count();
        return new SubmitView(passed, passedCount, results.size(), maskHiddenTests(results), toAttemptView(attempt, judgedAt));
    }

    @Transactional
    public AttemptView skip(Long userId, Long attemptId) {
        LocalDateTime now = LocalDateTime.now();
        ContestAttempt attempt = findOwnAttempt(userId, attemptId);
        ContestAttemptProblem slot = requireOpenSlot(attempt, now);
        slot.setStatus(ContestAttemptProblem.Status.SKIPPED);
        advance(attempt, now);
        return toAttemptView(attempt, now);
    }

    @Transactional
    public AttemptView finish(Long userId, Long attemptId) {
        LocalDateTime now = LocalDateTime.now();
        ContestAttempt attempt = findOwnAttempt(userId, attemptId);
        if (attempt.getStatus() == ContestAttempt.Status.IN_PROGRESS) {
            finalizeAttempt(attempt, now);
        }
        return toAttemptView(attempt, now);
    }


    private Season pickCurrentSeason(LocalDateTime now) {
        List<Season> all = seasonRepository.findAllByOrderByStartAtDesc();
        // Uu tien mua dang dien ra -> mua sap toi gan nhat -> mua vua ket thuc
        return all.stream().filter(s -> s.statusAt(now) == Season.Status.ACTIVE).findFirst()
                .or(() -> all.stream()
                        .filter(s -> s.statusAt(now) == Season.Status.UPCOMING)
                        .min(Comparator.comparing(Season::getStartAt)))
                .or(() -> all.stream().findFirst())
                .orElse(null);
    }

    private Season findSeason(Long seasonId) {
        return seasonRepository.findById(seasonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mùa giải."));
    }

    private ContestAttempt findOwnAttempt(Long userId, Long attemptId) {
        ContestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lượt thi."));
        if (!attempt.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lượt thi.");
        }
        return attempt;
    }

    private ContestAttemptProblem requireOpenSlot(ContestAttempt attempt, LocalDateTime now) {
        expireIfNeeded(attempt, now);
        if (attempt.getStatus() != ContestAttempt.Status.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lượt thi đã kết thúc.");
        }
        return attempt.getProblems().stream()
                .filter(p -> p.getStatus() == ContestAttemptProblem.Status.OPEN)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Không có bài nào đang mở."));
    }

    // Mo bai ke tiep; het bai -> chot luot
    private void advance(ContestAttempt attempt, LocalDateTime now) {
        Optional<ContestAttemptProblem> next = attempt.getProblems().stream()
                .filter(p -> p.getStatus() == ContestAttemptProblem.Status.LOCKED)
                .min(Comparator.comparingInt(ContestAttemptProblem::getPosition));
        if (next.isPresent()) {
            next.get().setStatus(ContestAttemptProblem.Status.OPEN);
            next.get().setOpenedAt(now);
        } else {
            finalizeAttempt(attempt, now);
        }
    }

    private void expireIfNeeded(ContestAttempt attempt, LocalDateTime now) {
        if (attempt.getStatus() == ContestAttempt.Status.IN_PROGRESS && !now.isBefore(attempt.getDeadlineAt())) {
            finalizeAttempt(attempt, attempt.getDeadlineAt());
        }
    }

    private void finalizeAttempt(ContestAttempt attempt, LocalDateTime finishedAt) {
        attempt.getProblems().forEach(p -> {
            if (p.getStatus() == ContestAttemptProblem.Status.OPEN || p.getStatus() == ContestAttemptProblem.Status.LOCKED) {
                p.setStatus(ContestAttemptProblem.Status.UNSOLVED);
            }
        });
        attempt.setSolvedCount((int) attempt.getProblems().stream()
                .filter(p -> p.getStatus() == ContestAttemptProblem.Status.SOLVED).count());
        attempt.setTotalTimeSeconds(attempt.getProblems().stream()
                .mapToLong(ContestAttemptProblem::timeSeconds).sum());
        attempt.setStatus(ContestAttempt.Status.FINISHED);
        attempt.setFinishedAt(finishedAt.isAfter(attempt.getDeadlineAt()) ? attempt.getDeadlineAt() : finishedAt);
    }

    private List<TestCaseResult> judge(CodeRequest body, Problem problem, int limit) {
        if (body == null || body.sourceCode() == null || body.sourceCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa có code để chấm.");
        }
        if (body.sourceCode().length() > MAX_SOURCE_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code quá dài.");
        }
        int languageId = body.languageId() != null ? body.languageId() : problem.getLanguageId();
        if (!ALLOWED_LANGUAGES.contains(languageId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngôn ngữ không được hỗ trợ.");
        }
        List<TestCaseEntity> testCases = problem.getTestCases() == null ? List.of() : problem.getTestCases();
        if (testCases.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bài thi chưa có test case.");
        }
        List<TestCase> cases = testCases.stream()
                .limit(limit)
                .map(tc -> new TestCase(tc.getInput(), tc.getExpectedOutput()))
                .toList();
        return judgeService.runAllTestCases(body.sourceCode(), languageId, cases);
    }

    // Chi giu chi tiet test mau; test an chi bao dung/sai de khong lo de
    private static List<TestCaseResult> maskHiddenTests(List<TestCaseResult> results) {
        for (int i = ProblemView.SAMPLE_COUNT; i < results.size(); i++) {
            TestCaseResult r = results.get(i);
            r.setInput(null);
            r.setExpectedOutput(null);
            r.setActualOutput(null);
            r.setErrorOutput(null);
        }
        return results;
    }

    private MyStanding standing(Season season, Long userId, LocalDateTime now) {
        List<ContestAttempt> mine = attemptRepository.findByUserAndSeason(userId, season.getId());
        mine.forEach(a -> expireIfNeeded(a, now));
        Long inProgress = mine.stream()
                .filter(a -> a.getStatus() == ContestAttempt.Status.IN_PROGRESS)
                .map(ContestAttempt::getId)
                .findFirst().orElse(null);
        BestResult best = bestOf(mine)
                .map(a -> new BestResult(a.getAttemptNo(), a.getSolvedCount(), a.getTotalTimeSeconds()))
                .orElse(null);
        Integer rank = null;
        if (best != null) {
            rank = computeLeaderboard(season, userId, now).stream()
                    .filter(LeaderboardRow::me)
                    .map(LeaderboardRow::rank)
                    .findFirst().orElse(null);
        }
        List<AttemptSummary> attempts = mine.stream().map(ContestService::toSummary).toList();
        return new MyStanding(mine.size(), Math.max(0, season.getMaxAttempts() - mine.size()), inProgress, best, rank, attempts,
                isRegistered(userId, season, mine));
    }

    // Da dang ky = co ban ghi dang ky, hoac da tung thi (du lieu cu truoc khi co tinh nang dang ky)
    private boolean isRegistered(Long userId, Season season, List<ContestAttempt> mine) {
        return !mine.isEmpty() || registrationRepository.existsByUserIdAndSeasonId(userId, season.getId());
    }

    private static Optional<ContestAttempt> bestOf(List<ContestAttempt> attempts) {
        return attempts.stream()
                .filter(a -> a.getStatus() == ContestAttempt.Status.FINISHED)
                .min(Comparator.comparingInt(ContestAttempt::getSolvedCount).reversed()
                        .thenComparingLong(ContestAttempt::getTotalTimeSeconds));
    }

    private List<LeaderboardRow> computeLeaderboard(Season season, Long userId, LocalDateTime now) {
        attemptRepository.findExpired(season.getId(), now).forEach(a -> finalizeAttempt(a, a.getDeadlineAt()));

        Map<Long, List<ContestAttempt>> byUser = attemptRepository.findBySeasonWithUser(season.getId()).stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        record Entry(User user, ContestAttempt best, int attemptsUsed) {
        }
        List<Entry> entries = new ArrayList<>();
        byUser.forEach((uid, list) -> bestOf(list)
                .ifPresent(best -> entries.add(new Entry(best.getUser(), best, list.size()))));

        entries.sort(Comparator
                .comparingInt((Entry e) -> e.best().getSolvedCount()).reversed()
                .thenComparingInt(Entry::attemptsUsed)
                .thenComparingLong(e -> e.best().getTotalTimeSeconds()));

        List<LeaderboardRow> rows = new ArrayList<>();
        for (int i = 0; i < entries.size(); i++) {
            Entry e = entries.get(i);
            // Bang nhau ca 3 tieu chi -> cung hang
            int rank = i + 1;
            if (i > 0) {
                Entry prev = entries.get(i - 1);
                if (prev.best().getSolvedCount() == e.best().getSolvedCount()
                        && prev.attemptsUsed() == e.attemptsUsed()
                        && prev.best().getTotalTimeSeconds() == e.best().getTotalTimeSeconds()) {
                    rank = rows.get(i - 1).rank();
                }
            }
            rows.add(new LeaderboardRow(rank, e.user().getId(), e.user().getFullName(),
                    e.best().getSolvedCount(), e.attemptsUsed(), e.best().getTotalTimeSeconds(),
                    e.user().getId().equals(userId)));
        }
        return rows;
    }

    // ── Chuyen sang DTO ─────────────────────────────────────────────────────

    public SeasonView toSeasonView(Season s, LocalDateTime now) {
        return new SeasonView(s.getId(), s.getName(), s.getDescription(), s.getStartAt(), s.getEndAt(),
                s.statusAt(now), s.getProblems().size(), s.getMaxAttempts(), s.getTimeLimitMinutes(),
                attemptRepository.countParticipants(s.getId()));
    }

    private static AttemptSummary toSummary(ContestAttempt a) {
        return new AttemptSummary(a.getId(), a.getAttemptNo(), a.getStatus(), a.getStartedAt(), a.getFinishedAt(),
                a.getSolvedCount(), a.getTotalTimeSeconds());
    }

    private AttemptView toAttemptView(ContestAttempt a, LocalDateTime now) {
        List<ProblemSlot> slots = a.getProblems().stream()
                .map(p -> new ProblemSlot(p.getPosition(), p.getStatus(), p.getSubmitCount(), p.timeSeconds()))
                .toList();
        CurrentProblem current = null;
        if (a.getStatus() == ContestAttempt.Status.IN_PROGRESS) {
            current = a.getProblems().stream()
                    .filter(p -> p.getStatus() == ContestAttemptProblem.Status.OPEN)
                    .findFirst()
                    .map(ContestService::toCurrentProblem)
                    .orElse(null);
        }
        long runningTime = a.getStatus() == ContestAttempt.Status.FINISHED
                ? a.getTotalTimeSeconds()
                : a.getProblems().stream().mapToLong(ContestAttemptProblem::timeSeconds).sum();
        int solved = (int) a.getProblems().stream()
                .filter(p -> p.getStatus() == ContestAttemptProblem.Status.SOLVED).count();
        return new AttemptView(a.getId(), a.getSeason().getId(), a.getSeason().getName(), a.getAttemptNo(),
                a.getSeason().getMaxAttempts(), a.getStatus(), a.getStartedAt(), a.getDeadlineAt(), a.getFinishedAt(),
                now, solved, runningTime, slots, current);
    }

    private static CurrentProblem toCurrentProblem(ContestAttemptProblem slot) {
        Problem p = slot.getProblem();
        ProblemView view = ProblemView.from(p);
        String title = view.templateName() != null && !view.templateName().isBlank()
                ? view.templateName()
                : "Bài " + (slot.getPosition() + 1);
        return new CurrentProblem(slot.getPosition(), p.getId(), title, p.getStatement(), p.getTopic(), p.getLevel(),
                p.getLanguageId(), view.samples(), slot.getOpenedAt());
    }
}
