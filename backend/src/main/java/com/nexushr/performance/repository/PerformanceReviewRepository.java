package com.nexushr.performance.repository;

import com.nexushr.performance.model.PerformanceReview;
import com.nexushr.performance.model.ReviewPeriod;
import com.nexushr.performance.model.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {

    Page<PerformanceReview> findByEmployeeIdOrderByYearDescCreatedAtDesc(UUID employeeId, Pageable pageable);

    Page<PerformanceReview> findByReviewerIdOrderByYearDescCreatedAtDesc(UUID reviewerId, Pageable pageable);

    Optional<PerformanceReview> findByEmployeeIdAndReviewPeriodAndYear(UUID employeeId, ReviewPeriod period, int year);

    List<PerformanceReview> findByEmployeeIdAndYear(UUID employeeId, int year);

    Page<PerformanceReview> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);

    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewer.id = :reviewerId AND pr.status IN ('PENDING', 'SELF_REVIEW', 'MANAGER_REVIEW') ORDER BY pr.dueDate ASC")
    List<PerformanceReview> findPendingReviewsByReviewer(@Param("reviewerId") UUID reviewerId);

    @Query("SELECT AVG(pr.overallRating) FROM PerformanceReview pr WHERE pr.employee.id = :empId AND pr.status = 'COMPLETED'")
    Double getAverageRating(@Param("empId") UUID employeeId);

    @Query("SELECT AVG(pr.overallRating) FROM PerformanceReview pr WHERE pr.status = 'COMPLETED'")
    Double getOverallAverageRating();

    long countByStatusAndYear(ReviewStatus status, int year);
}
