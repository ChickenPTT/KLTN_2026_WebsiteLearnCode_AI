package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.QuizSession;
import com.testModule.TestModule.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    List<QuizSession> findByUserOrderByCreatedAtDesc(User user);
}
