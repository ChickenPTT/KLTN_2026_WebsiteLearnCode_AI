package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.Problem;
import com.testModule.TestModule.Model.Season;
import com.testModule.TestModule.Model.SeasonProblem;
import com.testModule.TestModule.Model.TestCaseEntity;
import com.testModule.TestModule.Repository.ContestAttemptProblemRepository;
import com.testModule.TestModule.Repository.ContestAttemptRepository;
import com.testModule.TestModule.Repository.ProblemRepository;
import com.testModule.TestModule.Repository.SeasonRepository;
import com.testModule.TestModule.dto.ContestDtos.*;
import com.testModule.TestModule.dto.ProblemView;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

/*
 * Quan tri mua giai thi dau.
 * - Kho de cua mua: bai sinh tu template hoac sao chep tu ngan hang de, la bai thi (CONTEST) o trang thai nhap,
 *   khong hien o trang luyen tap. Admin chon dung 4 bai trong kho lam de thi (-> PUBLISHED).
 * - Da co nguoi thi: khong doi de, khong xoa mua, khong bo bai dang duoc chon.
 * - Hai mua khong duoc trung khoang thoi gian.
 */
@Service
public class AdminContestService {

    public static final int PROBLEMS_PER_SEASON = 4;

    private final SeasonRepository seasonRepository;
    private final ProblemRepository problemRepository;
    private final ContestAttemptRepository attemptRepository;
    private final ContestAttemptProblemRepository attemptProblemRepository;
    private final ContestService contestService;
    private final ProblemGeneratorService problemGeneratorService;

    public AdminContestService(SeasonRepository seasonRepository,
                               ProblemRepository problemRepository,
                               ContestAttemptRepository attemptRepository,
                               ContestAttemptProblemRepository attemptProblemRepository,
                               ContestService contestService,
                               ProblemGeneratorService problemGeneratorService) {
        this.seasonRepository = seasonRepository;
        this.problemRepository = problemRepository;
        this.attemptRepository = attemptRepository;
        this.attemptProblemRepository = attemptProblemRepository;
        this.contestService = contestService;
        this.problemGeneratorService = problemGeneratorService;
    }

    // ── Mua giai ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminSeasonView> list() {
        return seasonRepository.findAllByOrderByStartAtDesc().stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public AdminSeasonView get(Long id) {
        return toView(find(id));
    }

    @Transactional
    public AdminSeasonView create(SeasonWriteRequest req) {
        Season season = new Season();
        apply(season, req);
        return toView(seasonRepository.save(season));
    }

    @Transactional
    public AdminSeasonView update(Long id, SeasonWriteRequest req) {
        Season season = find(id);
        apply(season, req);
        return toView(season);
    }

    @Transactional
    public void delete(Long id) {
        Season season = find(id);
        if (attemptRepository.existsBySeason_Id(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mùa giải đã có người thi, không thể xóa.");
        }
        seasonRepository.delete(season);
        seasonRepository.flush();
        // Bai trong kho de chi phuc vu mua nay -> xoa theo
        problemRepository.deleteAll(problemRepository.findByPoolSeasonIdOrderByIdDesc(id));
    }

    // Chon dung 4 bai trong kho lam de thi; bai bi bo chon quay ve nhap (van la bai thi, khong lo ra luyen tap)
    @Transactional
    public AdminSeasonView setProblems(Long id, SeasonProblemsRequest req) {
        Season season = find(id);
        requireNoAttempts(id, "Đã có người thi, không thể đổi đề của mùa giải.");
        List<Long> ids = req == null || req.problemIds() == null ? List.of() : req.problemIds();
        if (ids.size() != PROBLEMS_PER_SEASON || new HashSet<>(ids).size() != PROBLEMS_PER_SEASON) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mỗi mùa giải cần đúng " + PROBLEMS_PER_SEASON + " bài khác nhau.");
        }
        List<Problem> chosen = new ArrayList<>();
        for (Long problemId : ids) {
            Problem problem = findProblem(problemId);
            boolean inPool = id.equals(problem.getPoolSeasonId())
                    || season.getProblems().stream().anyMatch(sp -> sp.getProblem().getId().equals(problemId));
            if (!inPool) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bài id " + problemId + " không thuộc kho đề của mùa giải.");
            }
            if (problem.getTestCases() == null || problem.getTestCases().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bài id " + problemId + " chưa có test case.");
            }
            chosen.add(problem);
        }

        Set<Long> chosenIds = new HashSet<>(ids);
        season.getProblems().stream()
                .map(SeasonProblem::getProblem)
                .filter(p -> !chosenIds.contains(p.getId()))
                .forEach(p -> p.setStatus(Problem.Status.DRAFT));
        season.getProblems().clear();
        seasonRepository.flush();
        for (int i = 0; i < chosen.size(); i++) {
            Problem problem = chosen.get(i);
            problem.setPurpose(Problem.Purpose.CONTEST);
            problem.setStatus(Problem.Status.PUBLISHED);
            if (problem.getPoolSeasonId() == null) problem.setPoolSeasonId(id);
            season.getProblems().add(new SeasonProblem(season, problem, i));
        }
        return toView(season);
    }

    // ── Kho de ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminPoolProblem> pool(Long seasonId) {
        Season season = find(seasonId);
        Map<Long, Integer> positions = new HashMap<>();
        season.getProblems().forEach(sp -> positions.put(sp.getProblem().getId(), sp.getPosition()));

        LinkedHashMap<Long, Problem> all = new LinkedHashMap<>();
        // Bai dang duoc chon dung truoc (ke ca bai cu tao bang SQL, chua co pool_season_id)
        season.getProblems().forEach(sp -> all.put(sp.getProblem().getId(), sp.getProblem()));
        problemRepository.findByPoolSeasonIdOrderByIdDesc(seasonId).forEach(p -> all.putIfAbsent(p.getId(), p));
        return all.values().stream().map(p -> toPoolView(p, positions.get(p.getId()))).toList();
    }

    // Sinh 1 bai tu template vao kho (1 lan goi = 1 bai; loi giai mau chay qua Judge0)
    @Transactional
    public AdminPoolProblem generateIntoPool(Long seasonId, PoolGenerateRequest req) {
        find(seasonId);
        requireNoAttempts(seasonId, "Đã có người thi, không thể thêm đề vào mùa giải.");
        if (req == null || req.templateId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn template.");
        }
        Problem problem;
        try {
            problem = problemGeneratorService.generateVariant(req.templateId(), Boolean.TRUE.equals(req.useAiParaphrase()));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Sinh đề thất bại: " + e.getMessage());
        }
        problem.setPurpose(Problem.Purpose.CONTEST);
        problem.setStatus(Problem.Status.DRAFT);
        problem.setPoolSeasonId(seasonId);
        return toPoolView(problemRepository.save(problem), null);
    }

    // Lay bai tu ngan hang de luyen tap: sao chep sang bai thi moi, bai goc giu nguyen o trang luyen tap
    @Transactional
    public AdminPoolProblem addFromBank(Long seasonId, PoolAddRequest req) {
        find(seasonId);
        requireNoAttempts(seasonId, "Đã có người thi, không thể thêm đề vào mùa giải.");
        if (req == null || req.problemId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn bài.");
        }
        Problem source = findProblem(req.problemId());
        if (source.isContest()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ lấy được bài từ ngân hàng đề luyện tập.");
        }
        if (source.getTestCases() == null || source.getTestCases().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bài này chưa có test case.");
        }
        Problem copy = new Problem();
        copy.setStatement(source.getStatement());
        copy.setLanguageId(source.getLanguageId());
        copy.setTopic(source.getTopic());
        copy.setLevel(source.getLevel());
        copy.setTemplate(source.getTemplate());
        copy.setReferenceSolution(source.getReferenceSolution());
        copy.setSourceType(source.getSourceType());
        copy.setPurpose(Problem.Purpose.CONTEST);
        copy.setStatus(Problem.Status.DRAFT);
        copy.setPoolSeasonId(seasonId);
        List<TestCaseEntity> cases = new ArrayList<>();
        for (TestCaseEntity tc : source.getTestCases()) {
            TestCaseEntity c = new TestCaseEntity();
            c.setInput(tc.getInput());
            c.setExpectedOutput(tc.getExpectedOutput());
            c.setProblem(copy);
            cases.add(c);
        }
        copy.setTestCases(cases);
        return toPoolView(problemRepository.save(copy), null);
    }

    @Transactional
    public void removeFromPool(Long seasonId, Long problemId) {
        Season season = find(seasonId);
        Problem problem = findProblem(problemId);
        boolean selected = season.getProblems().stream().anyMatch(sp -> sp.getProblem().getId().equals(problemId));
        if (!selected && !seasonId.equals(problem.getPoolSeasonId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài không thuộc kho đề của mùa giải.");
        }
        if (selected) {
            requireNoAttempts(seasonId, "Đã có người thi, không thể bỏ bài đang là đề thi.");
            season.getProblems().removeIf(sp -> sp.getProblem().getId().equals(problemId));
            seasonRepository.flush();
        }
        if (attemptProblemRepository.existsByProblem_Id(problemId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bài đã có người làm, không thể xóa.");
        }
        problemRepository.delete(problem);
    }

    // ── Noi bo ──────────────────────────────────────────────────────────────

    private Season find(Long id) {
        return seasonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mùa giải."));
    }

    private Problem findProblem(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài id: " + id));
    }

    private void requireNoAttempts(Long seasonId, String message) {
        if (attemptRepository.existsBySeason_Id(seasonId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }
    }

    private void apply(Season season, SeasonWriteRequest req) {
        if (req == null || req.name() == null || req.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên mùa giải không được trống.");
        }
        if (req.startAt() == null || req.endAt() == null || !req.endAt().isAfter(req.startAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải sau thời gian bắt đầu.");
        }
        int maxAttempts = req.maxAttempts() == null ? 3 : req.maxAttempts();
        int timeLimit = req.timeLimitMinutes() == null ? 90 : req.timeLimitMinutes();
        if (maxAttempts < 1 || maxAttempts > 10 || timeLimit < 5 || timeLimit > 600) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượt (1–10) hoặc thời gian (5–600 phút) không hợp lệ.");
        }
        // Khong cho 2 mua trung khoang thoi gian (hoc vien luon chi co 1 mua dang dien ra)
        seasonRepository.findAll().stream()
                .filter(other -> season.getId() == null || !other.getId().equals(season.getId()))
                .filter(other -> req.startAt().isBefore(other.getEndAt()) && other.getStartAt().isBefore(req.endAt()))
                .findFirst()
                .ifPresent(other -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Thời gian bị trùng với mùa giải \"" + other.getName() + "\".");
                });
        season.setName(req.name().trim());
        season.setDescription(req.description());
        season.setStartAt(req.startAt());
        season.setEndAt(req.endAt());
        season.setMaxAttempts(maxAttempts);
        season.setTimeLimitMinutes(timeLimit);
    }

    private static String titleOf(Problem p) {
        if (p.getTemplate() != null && p.getTemplate().getName() != null && !p.getTemplate().getName().isBlank()) {
            return p.getTemplate().getName();
        }
        return "Bài #" + p.getId();
    }

    private static AdminPoolProblem toPoolView(Problem p, Integer position) {
        ProblemView view = ProblemView.from(p);
        return new AdminPoolProblem(p.getId(), titleOf(p), p.getTopic(), p.getLevel(), p.getStatement(),
                view.samples(), view.testCaseCount(), p.getSourceType() == null ? null : p.getSourceType().name(),
                position != null, position, p.getCreatedAt(), p.getReferenceSolution());
    }

    private AdminSeasonView toView(Season season) {
        List<AdminSeasonProblem> problems = season.getProblems().stream()
                .map(sp -> {
                    Problem p = sp.getProblem();
                    return new AdminSeasonProblem(sp.getPosition(), p.getId(), titleOf(p), p.getTopic(), p.getLevel());
                })
                .toList();
        return new AdminSeasonView(contestService.toSeasonView(season, LocalDateTime.now()), problems,
                season.getId() != null && attemptRepository.existsBySeason_Id(season.getId()));
    }
}
