package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findByStatus(Problem.Status status);
}
