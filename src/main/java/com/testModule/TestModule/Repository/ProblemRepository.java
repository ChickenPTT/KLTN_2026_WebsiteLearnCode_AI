package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
}
