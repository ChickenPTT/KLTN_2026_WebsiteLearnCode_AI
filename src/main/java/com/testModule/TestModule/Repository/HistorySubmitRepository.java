package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.HistorySubmit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HistorySubmitRepository extends JpaRepository<HistorySubmit, Long> {

    List<HistorySubmit> findByStudentId(Long studentId);

    List<HistorySubmit> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    @Modifying
    @Query("delete from HistorySubmit h where h.problem.id = :problemId")
    int deleteByProblemId(@Param("problemId") Long problemId);

    @Modifying
    @Query("delete from HistorySubmit h where h.studentId = :studentId")
    int deleteByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(h) FROM HistorySubmit h WHERE h.submittedAt >= :startOfDay")
    long countSubmissionsToday(@Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT DATE(h.submittedAt) as day, COUNT(h) as count, SUM(CASE WHEN h.passed THEN 1 ELSE 0 END) as passedCount FROM HistorySubmit h " +
           "WHERE h.submittedAt >= :sevenDaysAgo " +
           "GROUP BY DATE(h.submittedAt) " +
           "ORDER BY DATE(h.submittedAt)")
    List<Object[]> countSubmissionsByDayLast7Days(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

    @Query("SELECT COUNT(h) FROM HistorySubmit h WHERE h.submittedAt >= :sevenDaysAgo")
    long countTotalSubmissionsLast7Days(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

    @Query("SELECT COUNT(h) FROM HistorySubmit h WHERE h.submittedAt >= :sevenDaysAgo AND h.passed = true")
    long countPassedSubmissionsLast7Days(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);

    @Query("SELECT h.problem.topic, COUNT(h) as count FROM HistorySubmit h " +
           "WHERE h.problem.topic IS NOT NULL " +
           "GROUP BY h.problem.topic " +
           "ORDER BY count DESC")
    List<Object[]> countSubmissionsByTopic();
}
