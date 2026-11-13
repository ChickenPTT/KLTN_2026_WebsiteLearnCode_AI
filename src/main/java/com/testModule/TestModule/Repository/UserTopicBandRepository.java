package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.UserTopicBand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserTopicBandRepository extends JpaRepository<UserTopicBand, Long> {

    @Query("select b from UserTopicBand b where b.user.id = :userId order by b.id")
    List<UserTopicBand> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("delete from UserTopicBand b where b.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);
    
   
}
