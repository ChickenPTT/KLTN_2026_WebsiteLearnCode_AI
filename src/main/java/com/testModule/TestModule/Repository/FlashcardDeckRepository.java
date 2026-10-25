package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {

    @Query("SELECT d FROM FlashcardDeck d LEFT JOIN FETCH d.terms WHERE d.id = :id")
    FlashcardDeck findByIdWithTerms(Long id);

    @Query("SELECT DISTINCT d FROM FlashcardDeck d LEFT JOIN FETCH d.terms WHERE d.id IN :ids")
    List<FlashcardDeck> findAllByIdWithTerms(List<Long> ids);

    @Query("SELECT DISTINCT d FROM FlashcardDeck d LEFT JOIN FETCH d.terms ORDER BY d.id")
    List<FlashcardDeck> findAllWithTerms();

    @Query("SELECT DISTINCT d FROM FlashcardDeck d LEFT JOIN FETCH d.terms WHERE d.ownerId = :ownerId ORDER BY d.id DESC")
    List<FlashcardDeck> findByOwnerIdWithTerms(Long ownerId);
}
