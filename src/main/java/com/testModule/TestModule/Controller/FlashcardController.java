package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.FlashcardDeck;
import com.testModule.TestModule.Model.FlashcardTerm;
import com.testModule.TestModule.Service.FlashcardService;
import com.testModule.TestModule.dto.AdminFlashcardStats;
import com.testModule.TestModule.dto.CreateDeckRequest;
import com.testModule.TestModule.dto.UpdateDeckRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flashcard/decks")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @GetMapping
    public List<FlashcardDeck> listDecks() {
        return flashcardService.listDecks();
    }

    @GetMapping("/{id}")
    public FlashcardDeck getDeck(@PathVariable Long id) {
        return flashcardService.getDeckWithTerms(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FlashcardDeck createDeck(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        return flashcardService.createDeck(name, description);
    }

    @PutMapping("/{id}")
    public FlashcardDeck updateDeck(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        return flashcardService.updateDeck(id, name, description);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDeck(@PathVariable Long id) {
        flashcardService.deleteDeck(id);
    }

    @PostMapping("/{deckId}/terms")
    @ResponseStatus(HttpStatus.CREATED)
    public FlashcardTerm addTerm(@PathVariable Long deckId, @RequestBody Map<String, String> body) {
        String term = body.get("term");
        String definition = body.get("definition");
        return flashcardService.addTerm(deckId, term, definition);
    }

    @PutMapping("/terms/{termId}")
    public FlashcardTerm updateTerm(@PathVariable Long termId, @RequestBody Map<String, String> body) {
        String term = body.get("term");
        String definition = body.get("definition");
        return flashcardService.updateTerm(termId, term, definition);
    }

    @DeleteMapping("/terms/{termId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTerm(@PathVariable Long termId) {
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
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường isPublic.");
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
