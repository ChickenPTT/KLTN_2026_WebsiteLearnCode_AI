package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findByStatus(Problem.Status status);

    List<Problem> findByTemplate_Id(Long templateId);

    long countBySourceType(Problem.SourceType sourceType);

    long countBySourceTypeAndStatus(Problem.SourceType sourceType, Problem.Status status);

    @Query("SELECT COUNT(p) FROM Problem p WHERE p.sourceType = :sourceType AND p.createdAt >= :since")
    long countBySourceTypeAndCreatedAtAfter(@Param("sourceType") Problem.SourceType sourceType, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(p) FROM Problem p WHERE p.sourceType = :sourceType AND p.status = :status AND p.createdAt >= :since")
    long countBySourceTypeAndStatusAndCreatedAtAfter(@Param("sourceType") Problem.SourceType sourceType, @Param("status") Problem.Status status, @Param("since") LocalDateTime since);
}
