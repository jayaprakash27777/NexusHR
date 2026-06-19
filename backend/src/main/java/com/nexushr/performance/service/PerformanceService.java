package com.nexushr.performance.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.performance.dto.*;
import com.nexushr.performance.model.GoalStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PerformanceService {

    // Reviews
    ApiResponse<PerformanceReviewResponse> createReview(CreateReviewRequest request);
    ApiResponse<PerformanceReviewResponse> submitSelfReview(UUID reviewId, SubmitSelfReviewRequest request);
    ApiResponse<PerformanceReviewResponse> submitManagerReview(UUID reviewId, SubmitManagerReviewRequest request);
    ApiResponse<PerformanceReviewResponse> acknowledgeReview(UUID reviewId);
    ApiResponse<PerformanceReviewResponse> getReviewById(UUID reviewId);
    PagedResponse<PerformanceReviewResponse> getReviewsByEmployee(UUID employeeId, int page, int size);
    PagedResponse<PerformanceReviewResponse> getReviewsByReviewer(UUID reviewerId, int page, int size);
    ApiResponse<List<PerformanceReviewResponse>> getPendingReviews(UUID reviewerId);

    // Goals
    ApiResponse<PerformanceGoalResponse> createGoal(CreateGoalRequest request);
    ApiResponse<PerformanceGoalResponse> updateGoalProgress(UUID goalId, String achievedValue, GoalStatus status);
    ApiResponse<PerformanceGoalResponse> scoreGoal(UUID goalId, BigDecimal selfScore, BigDecimal managerScore);
    ApiResponse<List<PerformanceGoalResponse>> getGoalsByEmployee(UUID employeeId);
    ApiResponse<List<PerformanceGoalResponse>> getGoalsByReview(UUID reviewId);
}
