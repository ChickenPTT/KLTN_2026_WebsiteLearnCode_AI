package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.FlashcardDeck;
import com.testModule.TestModule.Model.FlashcardStudyProgress;
import com.testModule.TestModule.Model.FlashcardTerm;
import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Security.AuthUserDetails;
import com.testModule.TestModule.Service.FlashcardService;
import com.testModule.TestModule.dto.AdminFlashcardStats;
import com.testModule.TestModule.dto.CreateDeckRequest;
import com.testModule.TestModule.dto.UpdateDeckRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flashcard/decks")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    private AuthUserDetails requireUser(AuthUserDetails user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập.");
        }
        return user;
    }

    private boolean isStaff(AuthUserDetails user) {
        return user.getUser().getRole() != Role.STUDENT;
    }

    @GetMapping
    public List<FlashcardDeck> listDecks() {
        return flashcardService.listDecks();
    }

    /** Bộ thẻ do user hiện tại tạo ("Bộ thẻ của tôi") */
    @GetMapping("/mine")
    public List<FlashcardDeck> listMyDecks(@AuthenticationPrincipal AuthUserDetails user) {
        return flashcardService.listMyDecks(requireUser(user).getUser().getId());
    }

    /** Tiến độ học (lật thẻ) của user hiện tại -> trang "Thư viện của bạn" */
    @GetMapping("/study-progress/mine")
    public List<FlashcardStudyProgress> listMyStudyProgress(@AuthenticationPrincipal AuthUserDetails user) {
        return flashcardService.listMyStudyProgress(requireUser(user).getUser().getId());
    }

    @PostMapping("/{id}/study-progress")
    public FlashcardStudyProgress saveStudyProgress(@PathVariable Long id, @RequestBody Map<String, Integer> body,
                                                    @AuthenticationPrincipal AuthUserDetails user) {
        int known = body.getOrDefault("knownCards", 0);
        int total = body.getOrDefault("totalCards", 0);
        return flashcardService.saveStudyProgress(requireUser(user).getUser().getId(), id, known, total);
    }

    @GetMapping("/{id}")
    public FlashcardDeck getDeck(@PathVariable Long id) {
        return flashcardService.getDeckWithTerms(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FlashcardDeck createDeck(@RequestBody Map<String, String> body, @AuthenticationPrincipal AuthUserDetails user) {
        requireUser(user);
        String name = body.get("name");
        String description = body.get("description");
        return flashcardService.createDeck(name, description, user.getUser().getId(),
                user.getUser().getFullName(), user.getUser().getRole().name());
    }

    @PutMapping("/{id}")
    public FlashcardDeck updateDeck(@PathVariable Long id, @RequestBody Map<String, String> body,
                                    @AuthenticationPrincipal AuthUserDetails user) {
        flashcardService.checkCanModify(id, requireUser(user).getUser().getId(), isStaff(user));
        String name = body.get("name");
        String description = body.get("description");
        return flashcardService.updateDeck(id, name, description);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDeck(@PathVariable Long id, @AuthenticationPrincipal AuthUserDetails user) {
        flashcardService.checkCanModify(id, requireUser(user).getUser().getId(), isStaff(user));
        flashcardService.deleteDeck(id);
    }

    @PostMapping("/{deckId}/terms")
    @ResponseStatus(HttpStatus.CREATED)
    public FlashcardTerm addTerm(@PathVariable Long deckId, @RequestBody Map<String, String> body,
                                 @AuthenticationPrincipal AuthUserDetails user) {
        flashcardService.checkCanModify(deckId, requireUser(user).getUser().getId(), isStaff(user));
        String term = body.get("term");
        String definition = body.get("definition");
        return flashcardService.addTerm(deckId, term, definition);
    }

    @PutMapping("/terms/{termId}")
    public FlashcardTerm updateTerm(@PathVariable Long termId, @RequestBody Map<String, String> body,
                                    @AuthenticationPrincipal AuthUserDetails user) {
        flashcardService.checkCanModifyTerm(termId, requireUser(user).getUser().getId(), isStaff(user));
        String term = body.get("term");
        String definition = body.get("definition");
        return flashcardService.updateTerm(termId, term, definition);
    }

    @DeleteMapping("/terms/{termId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTerm(@PathVariable Long termId, @AuthenticationPrincipal AuthUserDetails user) {
        flashcardService.checkCanModifyTerm(termId, requireUser(user).getUser().getId(), isStaff(user));
        flashcardService.deleteTerm(termId);
    }

    @GetMapping("/{deckId}/terms")
    public List<FlashcardTerm> getTermsByDeck(@PathVariable Long deckId) {
        return flashcardService.getTermsByDeck(deckId);
    }

    // ── Admin endpoints ──

    @PostMapping("/admin/bulk-create")
    @ResponseStatus(HttpStatus.CREATED)
    public FlashcardDeck bulkCreateDeck(@RequestBody CreateDeckRequest request) {
        return flashcardService.createDeckWithTerms(request);
    }

    @PutMapping("/admin/{id}/bulk-update")
    public FlashcardDeck bulkUpdateDeck(@PathVariable Long id, @RequestBody UpdateDeckRequest request) {
        return flashcardService.updateDeckWithTerms(id, request);
    }

    @PatchMapping("/{id}/public")
    public FlashcardDeck togglePublic(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean isPublic = body.get("isPublic");
        if (isPublic == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường isPublic.");
        }
        return flashcardService.togglePublic(id, isPublic);
    }

    @PostMapping("/{id}/view")
    public void incrementViewCount(@PathVariable Long id) {
        flashcardService.incrementViewCount(id);
    }

    @GetMapping("/admin/stats")
    public AdminFlashcardStats getAdminStats() {
        return flashcardService.getAdminStats();
    }
}
