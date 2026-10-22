package com.testModule.TestModule.Controller;

import com.testModule.TestModule.Model.FlashcardDeck;
import com.testModule.TestModule.Model.FlashcardTerm;
import com.testModule.TestModule.Service.FlashcardService;
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
}
