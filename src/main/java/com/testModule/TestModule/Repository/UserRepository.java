package com.testModule.TestModule.Repository;

import com.testModule.TestModule.Model.Role;
import com.testModule.TestModule.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();

    @Query("""
            SELECT u FROM User u
            WHERE (:role IS NULL OR u.role = :role)
              AND (CAST(:search AS string) IS NULL
                   OR LOWER(u.fullName) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')
                   OR LOWER(u.email) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%'))
            """)
    List<User> searchUsers(@Param("role") Role role, @Param("search") String search);
}
