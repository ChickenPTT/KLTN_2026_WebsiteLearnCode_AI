package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.FlashcardStudyProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FlashcardStudyProgressRepository extends JpaRepository<FlashcardStudyProgress, Long> {

    Optional<FlashcardStudyProgress> findByUserIdAndDeckId(Long userId, Long deckId);

    List<FlashcardStudyProgress> findByUserIdOrderByCompletedAtDesc(Long userId);
}
