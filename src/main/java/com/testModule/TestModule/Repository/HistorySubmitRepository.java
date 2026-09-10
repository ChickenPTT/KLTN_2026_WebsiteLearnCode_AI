package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.HistorySubmit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorySubmitRepository extends JpaRepository<HistorySubmit, Long> {

    List<HistorySubmit> findByStudentId(Long studentId);    }
