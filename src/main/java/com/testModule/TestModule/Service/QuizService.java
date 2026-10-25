package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.*;
import com.testModule.TestModule.Repository.*;
import com.testModule.TestModule.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuizService {

    // Timeout per round in seconds
    private static final long TIMEOUT_BY_DECK = 180;      // 3 minutes
    private static final long TIMEOUT_RANDOM = 300;       // 5 minutes

    // Terms per round
    private static final int TERMS_PER_ROUND_RANDOM = 10;
    private static final int TOTAL_TERMS_RANDOM = 30;     // 3 rounds * 10

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardTermRepository termRepository;
    private final QuizSessionRepository sessionRepository;
    private final QuizRoundResultRepository roundResultRepository;
    private final UserRepository userRepository;

    // Code se dc luu trong RAM duoi dang ConcurrentHashMap
    private final Map<Long, SessionState> activeSessions = new ConcurrentHashMap<>();

    public QuizService(FlashcardDeckRepository deckRepository,
                       FlashcardTermRepository termRepository,
                       QuizSessionRepository sessionRepository,
                       QuizRoundResultRepository roundResultRepository,
                       UserRepository userRepository) {
        this.deckRepository = deckRepository;
        this.termRepository = termRepository;
        this.sessionRepository = sessionRepository;
        this.roundResultRepository = roundResultRepository;
        this.userRepository = userRepository;
    }

    private static class RoundState {
        List<FlashcardTerm> roundTerms;
        List<GridCell> cells;
        Set<String> matchedCellIds;
        int matchedPairs;
        long roundStartTime;

        RoundState(List<FlashcardTerm> roundTerms, List<GridCell> cells) {
            this.roundTerms = roundTerms;
            this.cells = cells;
            this.matchedCellIds = new HashSet<>();
            this.matchedPairs = 0;
            this.roundStartTime = System.currentTimeMillis();
        }
    }

    /**
     * Internal class to track the entire quiz session state in memory.
     */
    private static class SessionState {
        List<List<FlashcardTerm>> allRounds;    // All rounds' terms
        List<RoundState> roundStates;           // Current and future round states
        long timeLimit;

        SessionState(List<List<FlashcardTerm>> allRounds, long timeLimit) {
            this.allRounds = allRounds;
            this.timeLimit = timeLimit;
            this.roundStates = new ArrayList<>();
            // Initialize first round
            if (!allRounds.isEmpty()) {
                List<GridCell> cells = buildGridCellsStatic(allRounds.get(0));
                this.roundStates.add(new RoundState(allRounds.get(0), cells));
            }
        }
    }

    /**
     * Start a new quiz session.
     */
    @Transactional
    public RoundResponse startQuiz(StartQuizRequest request) {
        User user = getCurrentUser();

        List<FlashcardTerm> allTerms;
        FlashcardDeck deck = null;
        QuizSession.QuizType quizType = request.quizType();

        if (quizType == QuizSession.QuizType.BY_DECK) {
            if (request.deckId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn bộ flashcard.");
            }
            deck = deckRepository.findByIdWithTerms(request.deckId());
            if (deck == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard.");
            }
            allTerms = deck.getTerms();
        } else if (quizType == QuizSession.QuizType.RANDOM) {
            if (request.deckIds() == null || request.deckIds().size() < 2) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kiểm tra random cần chọn ít nhất 2 bộ.");
            }
            List<FlashcardDeck> decks = deckRepository.findAllByIdWithTerms(request.deckIds());
            if (decks.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard nào.");
            }
            allTerms = new ArrayList<>();
            for (FlashcardDeck d : decks) {
                allTerms.addAll(d.getTerms());
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại quiz không hợp lệ.");
        }

        if (allTerms.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không có thuật ngữ nào để kiểm tra.");
        }

        // Shuffle all terms using Fisher-Yates
        List<FlashcardTerm> shuffled = new ArrayList<>(allTerms);
        fisherYatesShuffle(shuffled);

        // Determine rounds
        List<List<FlashcardTerm>> rounds;
        long timeLimit;
        if (quizType == QuizSession.QuizType.BY_DECK) {
            rounds = splitIntoRounds(shuffled, 6);  // ~6 terms per round for BY_DECK
            timeLimit = TIMEOUT_BY_DECK;
        } else {
            // RANDOM: take up to 30 terms, split into 3 rounds of 10
            int take = Math.min(shuffled.size(), TOTAL_TERMS_RANDOM);
            shuffled = shuffled.subList(0, take);
            rounds = splitIntoRounds(shuffled, TERMS_PER_ROUND_RANDOM);
            timeLimit = TIMEOUT_RANDOM;
        }

        // Create session
        QuizSession session = new QuizSession();
        session.setUser(user);
        session.setQuizType(quizType);
        session.setDeck(deck);
        session.setStatus(QuizSession.SessionStatus.IN_PROGRESS);
        session.setCurrentRound(1);
        session.setTotalRounds(rounds.size());
        session.setTimeRemaining(timeLimit);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        session = sessionRepository.save(session);

        // Store session state in memory
        SessionState sessionState = new SessionState(rounds, timeLimit);
        activeSessions.put(session.getId(), sessionState);

        RoundState state = sessionState.roundStates.get(0);
        return buildRoundResponse(session, 1, state.cells, state, timeLimit);
    }

    /**
     * Submit a pair of cells for matching.
     */
    @Transactional
    public PairResult submitPair(SubmitPairRequest request) {
        QuizSession session = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên quiz."));

        if (session.getStatus() == QuizSession.SessionStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz đã hoàn thành.");
        }

        SessionState sessionState = activeSessions.get(request.sessionId());
        if (sessionState == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phiên quiz không còn hoạt động.");
        }

        int roundIndex = session.getCurrentRound() - 1;
        if (roundIndex < 0 || roundIndex >= sessionState.roundStates.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Round không hợp lệ.");
        }

        RoundState state = sessionState.roundStates.get(roundIndex);

        // Check timeout
        long elapsed = (System.currentTimeMillis() - state.roundStartTime) / 1000;
        long timeRemaining = session.getTimeRemaining() - elapsed;
        if (timeRemaining <= 0) {
            return handleTimeout(session, sessionState, state);
        }

        // Find the two cells
        GridCell cell1 = null, cell2 = null;
        for (GridCell cell : state.cells) {
            if (cell.getCellId().equals(request.cellId1())) {
                cell1 = cell;
            }
            if (cell.getCellId().equals(request.cellId2())) {
                cell2 = cell;
            }
        }

        if (cell1 == null || cell2 == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy ô được chọn.");
        }

        // Check if cells are already matched
        if (state.matchedCellIds.contains(request.cellId1()) || state.matchedCellIds.contains(request.cellId2())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ô đã được ghép cặp.");
        }

        // Check if same type
        if (cell1.getCellType().equals(cell2.getCellType())) {
            return buildPairResult(false, state, session, timeRemaining);
        }

        // Check if they match (same termId)
        boolean isCorrect = cell1.getTermId().equals(cell2.getTermId());

        if (isCorrect) {
            state.matchedCellIds.add(request.cellId1());
            state.matchedCellIds.add(request.cellId2());
            state.matchedPairs++;
        }

        PairResult result = buildPairResult(isCorrect, state, session, timeRemaining);

        // Check if round is complete
        if (state.matchedPairs == state.roundTerms.size()) {
            result.setRoundCompleted(true);
            saveRoundResult(session, state, false);

            if (session.getCurrentRound() < session.getTotalRounds()) {
                // Move to next round — nothing extra needed, frontend will call getNextRound
            } else {
                // Quiz complete
                session.setStatus(QuizSession.SessionStatus.COMPLETED);
                session.setUpdatedAt(LocalDateTime.now());
                sessionRepository.save(session);
                activeSessions.remove(session.getId());
                result.setQuizCompleted(true);
            }
        }

        return result;
    }

    /**
     * Get the next round's grid after a round is completed.
     */
    public RoundResponse getNextRound(Long sessionId) {
        QuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên quiz."));

        if (session.getStatus() == QuizSession.SessionStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz đã hoàn thành.");
        }

        SessionState sessionState = activeSessions.get(sessionId);
        if (sessionState == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phiên quiz không còn hoạt động.");
        }

        int roundIndex = session.getCurrentRound() - 1;
        if (roundIndex < 0 || roundIndex >= sessionState.allRounds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không còn round nào.");
        }

        // Build the round state if not yet built
        while (roundIndex >= sessionState.roundStates.size()) {
            List<FlashcardTerm> terms = sessionState.allRounds.get(sessionState.roundStates.size());
            List<GridCell> cells = buildGridCellsStatic(terms);
            sessionState.roundStates.add(new RoundState(terms, cells));
        }

        RoundState state = sessionState.roundStates.get(roundIndex);
        // Reset timer for the new round
        session.setTimeRemaining(sessionState.timeLimit);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return buildRoundResponse(session, session.getCurrentRound(), state.cells, state, sessionState.timeLimit);
    }

    /**
     * Retry wrong terms from a completed quiz session.
     */
    @Transactional
    public RoundResponse retryWrong(Long sessionId) {
        User user = getCurrentUser();

        QuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên quiz."));

        if (session.getStatus() != QuizSession.SessionStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz chưa hoàn thành.");
        }

        // Collect wrong term IDs from all rounds
        List<QuizRoundResult> roundResults = roundResultRepository.findBySessionOrderByRoundNumberAsc(session);
        Set<Long> wrongTermIds = new HashSet<>();
        for (QuizRoundResult roundResult : roundResults) {
            for (QuizWrongTerm wrongTerm : roundResult.getWrongTerms()) {
                if (wrongTerm.getTerm() != null) {
                    wrongTermIds.add(wrongTerm.getTerm().getId());
                }
            }
        }

        if (wrongTermIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không có từ sai để ôn lại.");
        }

        // Fetch wrong terms
        List<FlashcardTerm> wrongTerms = termRepository.findAllById(new ArrayList<>(wrongTermIds));
        if (wrongTerms.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy từ sai.");
        }

        // Shuffle
        fisherYatesShuffle(wrongTerms);

        // Split into rounds
        List<List<FlashcardTerm>> rounds = splitIntoRounds(wrongTerms, 6);
        long timeLimit = TIMEOUT_BY_DECK;

        // Create new retry session
        QuizSession retrySession = new QuizSession();
        retrySession.setUser(user);
        retrySession.setQuizType(QuizSession.QuizType.RETRY_WRONG);
        retrySession.setStatus(QuizSession.SessionStatus.IN_PROGRESS);
        retrySession.setCurrentRound(1);
        retrySession.setTotalRounds(rounds.size());
        retrySession.setTimeRemaining(timeLimit);
        retrySession.setCreatedAt(LocalDateTime.now());
        retrySession.setUpdatedAt(LocalDateTime.now());
        retrySession = sessionRepository.save(retrySession);

        // Store session state in memory
        SessionState sessionState = new SessionState(rounds, timeLimit);
        activeSessions.put(retrySession.getId(), sessionState);

        RoundState state = sessionState.roundStates.get(0);
        return buildRoundResponse(retrySession, 1, state.cells, state, timeLimit);
    }

    /**
     * Get quiz results for a completed session.
     */
    public QuizResultResponse getQuizResult(Long sessionId) {
        QuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên quiz."));

        List<QuizRoundResult> roundResults = roundResultRepository.findBySessionOrderByRoundNumberAsc(session);

        QuizResultResponse response = new QuizResultResponse();
        response.setSessionId(session.getId());
        response.setTotalRounds(roundResults.size());

        int totalScore = 0;
        int totalPairs = 0;
        boolean hasWrongTerms = false;

        List<QuizResultResponse.RoundSummary> summaries = new ArrayList<>();
        for (QuizRoundResult roundResult : roundResults) {
            QuizResultResponse.RoundSummary summary = new QuizResultResponse.RoundSummary();
            summary.setRoundNumber(roundResult.getRoundNumber());
            summary.setScore(roundResult.getScore());
            summary.setTotalPairs(roundResult.getTotalPairs());
            summary.setTimeSpent(roundResult.getTimeSpent());
            summary.setTimeLimit(roundResult.getTimeLimit());
            summary.setTimeout(roundResult.getIsTimeout());

            totalScore += roundResult.getScore();
            totalPairs += roundResult.getTotalPairs();
            if (!roundResult.getWrongTerms().isEmpty()) {
                hasWrongTerms = true;
            }
            summaries.add(summary);
        }

        response.setTotalScore(totalScore);
        response.setTotalPairs(totalPairs);
        response.setRounds(summaries);
        response.setHasWrongTerms(hasWrongTerms);

        return response;
    }

    /**
     * Get quiz history for current user as DTOs — avoids circular reference with FlashcardDeck.
     */
    @Transactional
    public List<QuizSessionDto> getQuizHistory() {
        User user = getCurrentUser();
        List<QuizSession> sessions = sessionRepository.findByUserOrderByCreatedAtDesc(user);
        List<QuizSessionDto> dtos = new ArrayList<>();
        for (QuizSession s : sessions) {
            FlashcardDeck deck = s.getDeck();
            int wordCount = 0;
            if (deck != null && deck.getId() != null) {
                wordCount = (int) termRepository.countByDeckId(deck.getId());
            }
            QuizSessionDto dto = new QuizSessionDto(
                    s.getId(),
                    s.getQuizType().name(),
                    s.getStatus().name(),
                    s.getCurrentRound(),
                    s.getTotalRounds(),
                    s.getCreatedAt().toString(),
                    deck != null ? deck.getId() : null,
                    deck != null ? deck.getName() : null,
                    wordCount
            );
            dtos.add(dto);
        }
        return dtos;
    }

    // --- Helper methods ---

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập.");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng."));
    }

    private <T> void fisherYatesShuffle(List<T> list) {
        Random random = new Random();
        for (int i = list.size() - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            T temp = list.get(i);
            list.set(i, list.get(j));
            list.set(j, temp);
        }
    }

    private List<List<FlashcardTerm>> splitIntoRounds(List<FlashcardTerm> terms, int termsPerRound) {
        List<List<FlashcardTerm>> rounds = new ArrayList<>();
        if (terms.isEmpty()) {
            return rounds;
        }

        if (terms.size() <= termsPerRound) {
            rounds.add(new ArrayList<>(terms));
            return rounds;
        }

        // Split into roughly equal rounds
        int numRounds = (int) Math.ceil((double) terms.size() / termsPerRound);
        int baseSize = terms.size() / numRounds;
        int remainder = terms.size() % numRounds;

        int index = 0;
        for (int i = 0; i < numRounds; i++) {
            int size = baseSize + (i < remainder ? 1 : 0);
            rounds.add(new ArrayList<>(terms.subList(index, index + size)));
            index += size;
        }

        return rounds;
    }

    private static List<GridCell> buildGridCellsStatic(List<FlashcardTerm> terms) {
        List<GridCell> cells = new ArrayList<>();
        Random random = new Random();

        for (FlashcardTerm term : terms) {
            String termCellId = "cell-" + term.getId() + "-t-" + random.nextInt(100000);
            String defCellId = "cell-" + term.getId() + "-d-" + random.nextInt(100000);

            cells.add(new GridCell(termCellId, term.getId(), "TERM", term.getTerm()));
            cells.add(new GridCell(defCellId, term.getId(), "DEFINITION", term.getDefinition()));
        }

        // Shuffle cells
        Random rand = new Random();
        for (int i = cells.size() - 1; i > 0; i--) {
            int j = rand.nextInt(i + 1);
            GridCell temp = cells.get(i);
            cells.set(i, cells.get(j));
            cells.set(j, temp);
        }
        return cells;
    }

    private RoundResponse buildRoundResponse(QuizSession session, int roundNumber,
                                             List<GridCell> cells, RoundState state, long timeLimit) {
        RoundResponse response = new RoundResponse();
        response.setSessionId(session.getId());
        response.setRoundNumber(roundNumber);
        response.setTotalRounds(session.getTotalRounds());
        response.setTimeLimit(timeLimit);
        response.setTimeRemaining(session.getTimeRemaining());
        response.setCells(cells);
        response.setMatchedPairs(state.matchedPairs);
        response.setTotalPairs(state.roundTerms.size());
        return response;
    }

    private PairResult buildPairResult(boolean isCorrect, RoundState state,
                                       QuizSession session, long timeRemaining) {
        PairResult result = new PairResult();
        result.setCorrect(isCorrect);
        result.setMatchedPairs(state.matchedPairs);
        result.setTotalPairs(state.roundTerms.size());
        result.setTimeRemaining(Math.max(0, timeRemaining));
        result.setRoundCompleted(false);
        result.setQuizCompleted(false);
        return result;
    }

    private PairResult handleTimeout(QuizSession session, SessionState sessionState, RoundState state) {
        saveRoundResult(session, state, true);

        PairResult result = new PairResult();
        result.setCorrect(false);
        result.setMatchedPairs(state.matchedPairs);
        result.setTotalPairs(state.roundTerms.size());
        result.setTimeRemaining(0);
        result.setRoundCompleted(true);

        if (session.getCurrentRound() >= session.getTotalRounds()) {
            session.setStatus(QuizSession.SessionStatus.COMPLETED);
            session.setUpdatedAt(LocalDateTime.now());
            sessionRepository.save(session);
            activeSessions.remove(session.getId());
            result.setQuizCompleted(true);
        }

        return result;
    }

    private void saveRoundResult(QuizSession session, RoundState state, boolean isTimeout) {
        long timeSpent = (System.currentTimeMillis() - state.roundStartTime) / 1000;

        QuizRoundResult roundResult = new QuizRoundResult();
        roundResult.setSession(session);
        roundResult.setRoundNumber(session.getCurrentRound());
        roundResult.setScore(state.matchedPairs);
        roundResult.setTotalPairs(state.roundTerms.size());
        roundResult.setTimeSpent(timeSpent);
        roundResult.setTimeLimit(session.getTimeRemaining());
        roundResult.setIsTimeout(isTimeout);
        roundResult = roundResultRepository.save(roundResult);

        // Save wrong terms (terms that were not matched)
        Set<Long> matchedTermIds = new HashSet<>();
        for (String matchedCellId : state.matchedCellIds) {
            for (GridCell cell : state.cells) {
                if (cell.getCellId().equals(matchedCellId)) {
                    matchedTermIds.add(cell.getTermId());
                    break;
                }
            }
        }

        for (FlashcardTerm term : state.roundTerms) {
            if (!matchedTermIds.contains(term.getId())) {
                QuizWrongTerm wrongTerm = new QuizWrongTerm();
                wrongTerm.setRoundResult(roundResult);
                wrongTerm.setTerm(term);
                wrongTerm.setTermText(term.getTerm());
                wrongTerm.setDefinitionText(term.getDefinition());
                roundResult.getWrongTerms().add(wrongTerm);
            }
        }
        roundResultRepository.save(roundResult);

        // Move to next round
        session.setCurrentRound(session.getCurrentRound() + 1);
        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }
}
