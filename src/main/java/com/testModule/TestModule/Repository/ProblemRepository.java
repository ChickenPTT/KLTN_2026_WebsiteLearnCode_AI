package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findByStatus(Problem.Status status);

    // Bai luyen tap (purpose NULL o du lieu cu cung la luyen tap) — khong lo bai thi dau
    @Query("SELECT p FROM Problem p WHERE p.status = :status AND (p.purpose IS NULL OR p.purpose <> :contest)")
    List<Problem> findPracticeByStatus(@Param("status") Problem.Status status, @Param("contest") Problem.Purpose contest);

    // Trang quan ly de luyen tap cua admin: khong lan bai thi dau / kho de mua giai
    @Query("SELECT p FROM Problem p WHERE p.purpose IS NULL OR p.purpose <> :contest ORDER BY p.id DESC")
    List<Problem> findAllPractice(@Param("contest") Problem.Purpose contest);

    List<Problem> findByPoolSeasonIdOrderByIdDesc(Long poolSeasonId);

    long countByStatus(Problem.Status status);

    List<Problem> findByTemplate_Id(Long templateId);

    long countBySourceType(Problem.SourceType sourceType);

    long countBySourceTypeAndStatus(Problem.SourceType sourceType, Problem.Status status);

    @Query("SELECT COUNT(p) FROM Problem p WHERE p.sourceType = :sourceType AND p.createdAt >= :since")
    long countBySourceTypeAndCreatedAtAfter(@Param("sourceType") Problem.SourceType sourceType, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(p) FROM Problem p WHERE p.sourceType = :sourceType AND p.status = :status AND p.createdAt >= :since")
    long countBySourceTypeAndStatusAndCreatedAtAfter(@Param("sourceType") Problem.SourceType sourceType, @Param("status") Problem.Status status, @Param("since") LocalDateTime since);
}
