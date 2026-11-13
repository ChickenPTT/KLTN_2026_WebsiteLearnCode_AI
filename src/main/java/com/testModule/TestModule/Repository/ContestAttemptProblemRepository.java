package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.ContestAttemptProblem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestAttemptProblemRepository extends JpaRepository<ContestAttemptProblem, Long> {

    boolean existsByProblem_Id(Long problemId);
}
