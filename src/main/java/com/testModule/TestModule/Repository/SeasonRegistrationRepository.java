package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.SeasonRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeasonRegistrationRepository extends JpaRepository<SeasonRegistration, Long> {

    boolean existsByUserIdAndSeasonId(Long userId, Long seasonId);

    Optional<SeasonRegistration> findByUserIdAndSeasonId(Long userId, Long seasonId);

    long countBySeasonId(Long seasonId);
}
