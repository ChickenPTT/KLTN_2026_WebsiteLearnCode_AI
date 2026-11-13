package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.SeasonProblem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeasonProblemRepository extends JpaRepository<SeasonProblem, Long> {

    boolean existsByProblem_Id(Long problemId);
}
