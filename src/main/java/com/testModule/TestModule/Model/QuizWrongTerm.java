package com.testModule.TestModule.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_wrong_terms")
public class QuizWrongTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_result_id", nullable = false)
    private QuizRoundResult roundResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id")
    private FlashcardTerm term;

    @Column(nullable = false)
    private String termText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String definitionText;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuizRoundResult getRoundResult() {
        return roundResult;
    }

    public void setRoundResult(QuizRoundResult roundResult) {
        this.roundResult = roundResult;
    }

    public FlashcardTerm getTerm() {
        return term;
    }

    public void setTerm(FlashcardTerm term) {
        this.term = term;
    }

    public String getTermText() {
        return termText;
    }

    public void setTermText(String termText) {
        this.termText = termText;
    }

    public String getDefinitionText() {
        return definitionText;
    }

    public void setDefinitionText(String definitionText) {
        this.definitionText = definitionText;
    }
}
