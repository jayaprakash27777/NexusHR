package com.nexushr.performance.repository;

import com.nexushr.performance.model.GoalStatus;
import com.nexushr.performance.model.PerformanceGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceGoalRepository extends JpaRepository<PerformanceGoal, UUID> {

    List<PerformanceGoal> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);

    Page<PerformanceGoal> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId, Pageable pageable);

    List<PerformanceGoal> findByReviewId(UUID reviewId);

    List<PerformanceGoal> findByEmployeeIdAndStatus(UUID employeeId, GoalStatus status);

    long countByEmployeeIdAndStatus(UUID employeeId, GoalStatus status);
}
