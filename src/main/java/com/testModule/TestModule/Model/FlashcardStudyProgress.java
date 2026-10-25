package com.testModule.TestModule.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Kết quả lần học (lật thẻ) gần nhất của 1 user với 1 bộ thẻ -> hiển thị ở "Thư viện của bạn" */
@Entity
@Table(name = "flashcard_study_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "deckId"}))
public class FlashcardStudyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long deckId;

    private int knownCards;
    private int totalCards;

    @Column(nullable = false)
    private LocalDateTime completedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getDeckId() { return deckId; }
    public void setDeckId(Long deckId) { this.deckId = deckId; }

    public int getKnownCards() { return knownCards; }
    public void setKnownCards(int knownCards) { this.knownCards = knownCards; }

    public int getTotalCards() { return totalCards; }
    public void setTotalCards(int totalCards) { this.totalCards = totalCards; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
