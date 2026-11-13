package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.UserSelfAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserSelfAssessmentRepository extends JpaRepository<UserSelfAssessment, Long> {

    @Query("select a from UserSelfAssessment a where a.user.id = :userId order by a.id")
    List<UserSelfAssessment> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("delete from UserSelfAssessment a where a.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
