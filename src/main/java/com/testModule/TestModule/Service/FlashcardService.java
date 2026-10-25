package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.FlashcardDeck;
import com.testModule.TestModule.Model.FlashcardStudyProgress;
import com.testModule.TestModule.Model.FlashcardTerm;
import com.testModule.TestModule.Repository.FlashcardDeckRepository;
import com.testModule.TestModule.Repository.FlashcardStudyProgressRepository;
import com.testModule.TestModule.Repository.FlashcardTermRepository;
import com.testModule.TestModule.dto.AdminFlashcardStats;
import com.testModule.TestModule.dto.CreateDeckRequest;
import com.testModule.TestModule.dto.TermRequest;
import com.testModule.TestModule.dto.UpdateDeckRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FlashcardService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardTermRepository termRepository;
    private final FlashcardStudyProgressRepository studyProgressRepository;

    public FlashcardService(FlashcardDeckRepository deckRepository, FlashcardTermRepository termRepository,
                            FlashcardStudyProgressRepository studyProgressRepository) {
        this.deckRepository = deckRepository;
        this.termRepository = termRepository;
        this.studyProgressRepository = studyProgressRepository;
    }

    /** Lưu kết quả học xong 1 bộ thẻ (ghi đè lần học trước của cùng user + deck) */
    @Transactional
    public FlashcardStudyProgress saveStudyProgress(Long userId, Long deckId, int knownCards, int totalCards) {
        if (!deckRepository.existsById(deckId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard.");
        }
        FlashcardStudyProgress progress = studyProgressRepository.findByUserIdAndDeckId(userId, deckId)
                .orElseGet(FlashcardStudyProgress::new);
        progress.setUserId(userId);
        progress.setDeckId(deckId);
        progress.setKnownCards(Math.max(0, knownCards));
        progress.setTotalCards(Math.max(0, totalCards));
        progress.setCompletedAt(LocalDateTime.now());
        return studyProgressRepository.save(progress);
    }

    public List<FlashcardStudyProgress> listMyStudyProgress(Long userId) {
        return studyProgressRepository.findByUserIdOrderByCompletedAtDesc(userId);
    }

    public List<FlashcardDeck> listDecks() {
        return deckRepository.findAllWithTerms();
    }

    public FlashcardDeck getDeckWithTerms(Long id) {
        FlashcardDeck deck = deckRepository.findByIdWithTerms(id);
        if (deck == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard.");
        }
        return deck;
    }

    public List<FlashcardDeck> listMyDecks(Long ownerId) {
        return deckRepository.findByOwnerIdWithTerms(ownerId);
    }

    /** Chỉ chủ bộ thẻ hoặc ADMIN/TEACHER mới được sửa/xóa */
    public void checkCanModify(Long deckId, Long userId, boolean staff) {
        if (staff) return;
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard."));
        if (deck.getOwnerId() == null || !deck.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền chỉnh sửa bộ flashcard này.");
        }
    }

    public void checkCanModifyTerm(Long termId, Long userId, boolean staff) {
        if (staff) return;
        FlashcardTerm term = termRepository.findById(termId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thuật ngữ."));
        checkCanModify(term.getDeck().getId(), userId, false);
    }

    @Transactional
    public FlashcardDeck createDeck(String name, String description, Long ownerId, String authorName, String authorRole) {
        FlashcardDeck deck = createDeck(name, description);
        deck.setOwnerId(ownerId);
        deck.setAuthorName(authorName);
        deck.setAuthorRole(authorRole);
        deck.setIsPublic(false);
        return deckRepository.save(deck);
    }

    @Transactional
    public FlashcardDeck createDeck(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bộ flashcard không được để trống.");
        }
        if (name.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bộ flashcard quá dài.");
        }

        FlashcardDeck deck = new FlashcardDeck();
        deck.setName(name.trim());
        deck.setDescription(description);
        return deckRepository.save(deck);
    }

    @Transactional
    public FlashcardDeck updateDeck(Long id, String name, String description) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard."));

        if (name != null && !name.isBlank()) {
            if (name.length() > 255) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bộ flashcard quá dài.");
            }
            deck.setName(name.trim());
        }
        if (description != null) {
            deck.setDescription(description);
        }
        return deckRepository.save(deck);
    }

    @Transactional
    public void deleteDeck(Long id) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard."));
        deckRepository.delete(deck);
    }

    @Transactional
    public FlashcardTerm addTerm(Long deckId, String term, String definition) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard."));

        if (term == null || term.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thuật ngữ không được để trống.");
        }
        if (definition == null || definition.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định nghĩa không được để trống.");
        }

        FlashcardTerm flashcardTerm = new FlashcardTerm();
        flashcardTerm.setTerm(term.trim());
        flashcardTerm.setDefinition(definition.trim());
        flashcardTerm.setDeck(deck);
        return termRepository.save(flashcardTerm);
    }

    @Transactional
    public FlashcardTerm updateTerm(Long termId, String term, String definition) {
        FlashcardTerm flashcardTerm = termRepository.findById(termId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thuật ngữ."));

        if (term != null && !term.isBlank()) {
            flashcardTerm.setTerm(term.trim());
        }
        if (definition != null && !definition.isBlank()) {
            flashcardTerm.setDefinition(definition.trim());
        }
        return termRepository.save(flashcardTerm);
    }

    @Transactional
    public void deleteTerm(Long termId) {
        if (!termRepository.existsById(termId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thuật ngữ.");
        }
        termRepository.deleteById(termId);
    }

    public List<FlashcardTerm> getTermsByDeck(Long deckId) {
        return termRepository.findByDeckId(deckId);
    }


    @Transactional
    public FlashcardDeck createDeckWithTerms(CreateDeckRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bộ flashcard không được để trống.");
        }
        if (request.name().length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bộ flashcard quá dài.");
        }

        FlashcardDeck deck = new FlashcardDeck();
        deck.setName(request.name().trim());
        deck.setDescription(request.description());
        deck.setAuthorName(request.authorName());
        deck.setAuthorRole(request.authorRole());
        deck.setIsPublic(request.isPublic() != null ? request.isPublic() : true);
        deck.setViewCount(0L);

        deck = deckRepository.save(deck);

        // Bulk add terms
        if (request.terms() != null && !request.terms().isEmpty()) {
            List<FlashcardTerm> terms = new ArrayList<>();
            for (TermRequest tr : request.terms()) {
                if (tr.term() != null && !tr.term().isBlank() && tr.definition() != null && !tr.definition().isBlank()) {
                    FlashcardTerm term = new FlashcardTerm();
                    term.setTerm(tr.term().trim());
                    term.setDefinition(tr.definition().trim());
                    term.setDeck(deck);
                    terms.add(term);
                }
            }
            termRepository.saveAll(terms);
            deck.setTerms(terms);
        }

        return deck;
    }

    @Transactional
    public FlashcardDeck updateDeckWithTerms(Long id, UpdateDeckRequest request) {
        // Load deck với terms để có managed entity
        FlashcardDeck deck = deckRepository.findByIdWithTerms(id);
        if (deck == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard.");
        }

        if (request.name() != null && !request.name().isBlank()) {
            if (request.name().length() > 255) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên bộ flashcard quá dài.");
            }
            deck.setName(request.name().trim());
        }
        if (request.description() != null) {
            deck.setDescription(request.description());
        }
        if (request.authorName() != null) {
            deck.setAuthorName(request.authorName());
        }
        if (request.authorRole() != null) {
            deck.setAuthorRole(request.authorRole());
        }
        if (request.isPublic() != null) {
            deck.setIsPublic(request.isPublic());
        }
        if (request.terms() != null) {
            deck.getTerms().clear();

            // Thêm terms mới vào collection — cascade = ALL sẽ tự persist
            for (TermRequest tr : request.terms()) {
                if (tr.term() != null && !tr.term().isBlank() && tr.definition() != null && !tr.definition().isBlank()) {
                    FlashcardTerm term = new FlashcardTerm();
                    term.setTerm(tr.term().trim());
                    term.setDefinition(tr.definition().trim());
                    term.setDeck(deck);
                    deck.getTerms().add(term);
                }
            }
        }

        return deckRepository.save(deck);
    }

    // ── Admin: Toggle public status ──

    @Transactional
    public FlashcardDeck togglePublic(Long id, Boolean isPublic) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard."));
        deck.setIsPublic(isPublic);
        return deckRepository.save(deck);
    }

    @Transactional
    public void incrementViewCount(Long id) {
        deckRepository.findById(id).ifPresent(deck -> {
            deck.setViewCount(deck.getViewCount() + 1);
            deckRepository.save(deck);
        });
    }

    public AdminFlashcardStats getAdminStats() {
        List<FlashcardDeck> allDecks = deckRepository.findAll();
        int totalDecks = allDecks.size();
        int totalTerms = 0;
        int publicDecks = 0;
        int unpublicDecks = 0;
        int adminDecks = 0;
        int teacherDecks = 0;
        int studentDecks = 0;

        for (FlashcardDeck deck : allDecks) {
            totalTerms += termRepository.findByDeckId(deck.getId()).size();

            if (Boolean.TRUE.equals(deck.getIsPublic())) {
                publicDecks++;
            } else {
                unpublicDecks++;
            }
            String role = deck.getAuthorRole();
            if ("admin".equals(role)) {
                adminDecks++;
            } else if ("teacher".equals(role)) {
                teacherDecks++;
            } else if ("student".equals(role)) {
                studentDecks++;
            }
        }
        return new AdminFlashcardStats(totalDecks, totalTerms, publicDecks, unpublicDecks, adminDecks, teacherDecks, studentDecks);
    }
}
