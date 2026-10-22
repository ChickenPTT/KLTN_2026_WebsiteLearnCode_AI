package com.testModule.TestModule.Service;

import com.testModule.TestModule.Model.FlashcardDeck;
import com.testModule.TestModule.Model.FlashcardTerm;
import com.testModule.TestModule.Repository.FlashcardDeckRepository;
import com.testModule.TestModule.Repository.FlashcardTermRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FlashcardService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardTermRepository termRepository;

    public FlashcardService(FlashcardDeckRepository deckRepository, FlashcardTermRepository termRepository) {
        this.deckRepository = deckRepository;
        this.termRepository = termRepository;
    }

    public List<FlashcardDeck> listDecks() {
        return deckRepository.findAll(org.springframework.data.domain.Sort.by("id"));
    }

    public FlashcardDeck getDeckWithTerms(Long id) {
        FlashcardDeck deck = deckRepository.findByIdWithTerms(id);
        if (deck == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ flashcard.");
        }
        return deck;
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
}
