package com.nexushr.performance.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.performance.dto.*;
import com.nexushr.performance.model.GoalStatus;
import com.nexushr.performance.service.PerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/performance")
@RequiredArgsConstructor
@Tag(name = "Performance Management", description = "Performance reviews and goal tracking")
public class PerformanceController {

    private final PerformanceService performanceService;

    // ========================= REVIEWS =========================

    @PostMapping("/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create review", description = "Initiate a performance review cycle (Admin/Manager)")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(performanceService.createReview(request));
    }

    @PatchMapping("/reviews/{reviewId}/self-review")
    @Operation(summary = "Submit self review", description = "Employee submits their self-assessment")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> submitSelfReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody SubmitSelfReviewRequest request) {
        return ResponseEntity.ok(performanceService.submitSelfReview(reviewId, request));
    }

    @PatchMapping("/reviews/{reviewId}/manager-review")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Submit manager review", description = "Manager submits their assessment and rating")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> submitManagerReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody SubmitManagerReviewRequest request) {
        return ResponseEntity.ok(performanceService.submitManagerReview(reviewId, request));
    }

    @PatchMapping("/reviews/{reviewId}/acknowledge")
    @Operation(summary = "Acknowledge review", description = "Employee acknowledges the completed review")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> acknowledgeReview(
            @PathVariable UUID reviewId) {
        return ResponseEntity.ok(performanceService.acknowledgeReview(reviewId));
    }

    @GetMapping("/reviews/{reviewId}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ApiResponse<PerformanceReviewResponse>> getReview(
            @PathVariable UUID reviewId) {
        return ResponseEntity.ok(performanceService.getReviewById(reviewId));
    }

    @GetMapping("/reviews/employee/{employeeId}")
    @Operation(summary = "Get employee reviews", description = "Get all reviews for an employee")
    public ResponseEntity<PagedResponse<PerformanceReviewResponse>> getEmployeeReviews(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(performanceService.getReviewsByEmployee(employeeId, page, size));
    }

    @GetMapping("/reviews/reviewer/{reviewerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get reviews by reviewer", description = "Reviews assigned to a manager")
    public ResponseEntity<PagedResponse<PerformanceReviewResponse>> getReviewerReviews(
            @PathVariable UUID reviewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(performanceService.getReviewsByReviewer(reviewerId, page, size));
    }

    @GetMapping("/reviews/pending/{reviewerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Pending reviews", description = "Get pending reviews for a manager to complete")
    public ResponseEntity<ApiResponse<List<PerformanceReviewResponse>>> getPendingReviews(
            @PathVariable UUID reviewerId) {
        return ResponseEntity.ok(performanceService.getPendingReviews(reviewerId));
    }

    // ========================= GOALS =========================

    @PostMapping("/goals")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create goal", description = "Create a performance goal/KPI for an employee")
    public ResponseEntity<ApiResponse<PerformanceGoalResponse>> createGoal(
            @Valid @RequestBody CreateGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(performanceService.createGoal(request));
    }

    @PatchMapping("/goals/{goalId}/progress")
    @Operation(summary = "Update goal progress", description = "Update achieved value and status")
    public ResponseEntity<ApiResponse<PerformanceGoalResponse>> updateProgress(
            @PathVariable UUID goalId,
            @RequestParam(required = false) String achievedValue,
            @RequestParam(required = false) GoalStatus status) {
        return ResponseEntity.ok(performanceService.updateGoalProgress(goalId, achievedValue, status));
    }

    @PatchMapping("/goals/{goalId}/score")
    @Operation(summary = "Score goal", description = "Assign self or manager score (1.0 - 5.0)")
    public ResponseEntity<ApiResponse<PerformanceGoalResponse>> scoreGoal(
            @PathVariable UUID goalId,
            @RequestParam(required = false) BigDecimal selfScore,
            @RequestParam(required = false) BigDecimal managerScore) {
        return ResponseEntity.ok(performanceService.scoreGoal(goalId, selfScore, managerScore));
    }

    @GetMapping("/goals/employee/{employeeId}")
    @Operation(summary = "Get employee goals", description = "All goals for an employee")
    public ResponseEntity<ApiResponse<List<PerformanceGoalResponse>>> getEmployeeGoals(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(performanceService.getGoalsByEmployee(employeeId));
    }

    @GetMapping("/goals/review/{reviewId}")
    @Operation(summary = "Get review goals", description = "Goals linked to a specific review")
    public ResponseEntity<ApiResponse<List<PerformanceGoalResponse>>> getReviewGoals(
            @PathVariable UUID reviewId) {
        return ResponseEntity.ok(performanceService.getGoalsByReview(reviewId));
    }
}
