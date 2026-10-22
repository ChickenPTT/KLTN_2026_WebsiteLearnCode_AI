package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.FlashcardTerm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlashcardTermRepository extends JpaRepository<FlashcardTerm, Long> {

    List<FlashcardTerm> findByDeckId(Long deckId);

    List<FlashcardTerm> findByDeckIdIn(List<Long> deckIds);
}
