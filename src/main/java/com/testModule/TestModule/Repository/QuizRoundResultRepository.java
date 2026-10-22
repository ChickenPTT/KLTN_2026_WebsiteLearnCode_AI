package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.QuizRoundResult;
import com.testModule.TestModule.Model.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRoundResultRepository extends JpaRepository<QuizRoundResult, Long> {

    List<QuizRoundResult> findBySessionOrderByRoundNumberAsc(QuizSession session);
}
