package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Season;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeasonRepository extends JpaRepository<Season, Long> {

    List<Season> findAllByOrderByStartAtDesc();
}
