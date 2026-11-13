package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.ContestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ContestAttemptRepository extends JpaRepository<ContestAttempt, Long> {

    @Query("select a from ContestAttempt a where a.user.id = :userId and a.season.id = :seasonId order by a.attemptNo")
    List<ContestAttempt> findByUserAndSeason(@Param("userId") Long userId, @Param("seasonId") Long seasonId);

    @Query("select a from ContestAttempt a join fetch a.user where a.season.id = :seasonId")
    List<ContestAttempt> findBySeasonWithUser(@Param("seasonId") Long seasonId);

    @Query("select a from ContestAttempt a where a.season.id = :seasonId and a.status = com.testModule.TestModule.Model.ContestAttempt.Status.IN_PROGRESS and a.deadlineAt <= :now")
    List<ContestAttempt> findExpired(@Param("seasonId") Long seasonId, @Param("now") LocalDateTime now);

    @Query("select a from ContestAttempt a where a.user.id = :userId")
    List<ContestAttempt> findByUserId(@Param("userId") Long userId);

    @Query("select count(distinct a.user.id) from ContestAttempt a where a.season.id = :seasonId")
    long countParticipants(@Param("seasonId") Long seasonId);

    boolean existsBySeason_Id(Long seasonId);
}
