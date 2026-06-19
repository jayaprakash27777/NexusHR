package com.nexushr.performance.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.performance.dto.*;
import com.nexushr.performance.model.*;
import com.nexushr.performance.repository.PerformanceGoalRepository;
import com.nexushr.performance.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceReviewRepository reviewRepository;
    private final PerformanceGoalRepository goalRepository;
    private final EmployeeRepository employeeRepository;

    // ========================= REVIEWS =========================

    @Override
    @Transactional
    public ApiResponse<PerformanceReviewResponse> createReview(CreateReviewRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
        Employee reviewer = employeeRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer", "id", request.getReviewerId()));

        if (reviewRepository.findByEmployeeIdAndReviewPeriodAndYear(
                request.getEmployeeId(), request.getReviewPeriod(), request.getYear()).isPresent()) {
            throw new BadRequestException("Review already exists for " + employee.getFullName() +
                    " for " + request.getReviewPeriod() + " " + request.getYear());
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewPeriod(request.getReviewPeriod())
                .year(request.getYear())
                .status(ReviewStatus.PENDING)
                .dueDate(request.getDueDate())
                .build();

        PerformanceReview saved = reviewRepository.save(review);
        log.info("Performance review created for {} ({} {})", employee.getEmployeeId(),
                request.getReviewPeriod(), request.getYear());

        return ApiResponse.success("Performance review created", mapReviewResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<PerformanceReviewResponse> submitSelfReview(UUID reviewId, SubmitSelfReviewRequest request) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", reviewId));

        if (review.getStatus() != ReviewStatus.PENDING && review.getStatus() != ReviewStatus.SELF_REVIEW) {
            throw new BadRequestException("Self review can only be submitted when status is PENDING or SELF_REVIEW");
        }

        review.setSelfRating(request.getSelfRating());
        review.setStrengths(request.getStrengths());
        review.setImprovements(request.getImprovements());
        review.setEmployeeComments(request.getEmployeeComments());
        review.setStatus(ReviewStatus.MANAGER_REVIEW);

        PerformanceReview saved = reviewRepository.save(review);
        log.info("Self review submitted for review {}", reviewId);

        return ApiResponse.success("Self review submitted. Awaiting manager review.", mapReviewResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<PerformanceReviewResponse> submitManagerReview(UUID reviewId, SubmitManagerReviewRequest request) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", reviewId));

        if (review.getStatus() != ReviewStatus.MANAGER_REVIEW) {
            throw new BadRequestException("Manager review can only be submitted when status is MANAGER_REVIEW");
        }

        review.setManagerRating(request.getManagerRating());
        review.setManagerComments(request.getManagerComments());
        if (request.getStrengths() != null) review.setStrengths(request.getStrengths());
        if (request.getImprovements() != null) review.setImprovements(request.getImprovements());

        // Calculate overall rating: average of self and manager ratings
        BigDecimal overall;
        if (review.getSelfRating() != null) {
            overall = review.getSelfRating().add(request.getManagerRating())
                    .divide(BigDecimal.valueOf(2), 1, RoundingMode.HALF_UP);
        } else {
            overall = request.getManagerRating();
        }
        review.setOverallRating(overall);
        review.setStatus(ReviewStatus.COMPLETED);
        review.setCompletedAt(LocalDateTime.now());

        PerformanceReview saved = reviewRepository.save(review);
        log.info("Manager review submitted for review {}. Overall rating: {}", reviewId, overall);

        return ApiResponse.success("Review completed. Overall rating: " + overall, mapReviewResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<PerformanceReviewResponse> acknowledgeReview(UUID reviewId) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", reviewId));

        if (review.getStatus() != ReviewStatus.COMPLETED) {
            throw new BadRequestException("Only completed reviews can be acknowledged");
        }

        review.setStatus(ReviewStatus.ACKNOWLEDGED);
        PerformanceReview saved = reviewRepository.save(review);
        log.info("Review {} acknowledged by employee", reviewId);

        return ApiResponse.success("Review acknowledged", mapReviewResponse(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PerformanceReviewResponse> getReviewById(UUID reviewId) {
        PerformanceReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", reviewId));
        return ApiResponse.success(mapReviewResponse(review));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PerformanceReviewResponse> getReviewsByEmployee(UUID employeeId, int page, int size) {
        Page<PerformanceReview> reviewPage = reviewRepository
                .findByEmployeeIdOrderByYearDescCreatedAtDesc(employeeId, PageRequest.of(page, size));
        return buildPagedResponse(reviewPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PerformanceReviewResponse> getReviewsByReviewer(UUID reviewerId, int page, int size) {
        Page<PerformanceReview> reviewPage = reviewRepository
                .findByReviewerIdOrderByYearDescCreatedAtDesc(reviewerId, PageRequest.of(page, size));
        return buildPagedResponse(reviewPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PerformanceReviewResponse>> getPendingReviews(UUID reviewerId) {
        List<PerformanceReviewResponse> pending = reviewRepository.findPendingReviewsByReviewer(reviewerId)
                .stream().map(this::mapReviewResponse).collect(Collectors.toList());
        return ApiResponse.success(pending);
    }

    // ========================= GOALS =========================

    @Override
    @Transactional
    public ApiResponse<PerformanceGoalResponse> createGoal(CreateGoalRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        PerformanceReview review = null;
        if (request.getReviewId() != null) {
            review = reviewRepository.findById(request.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", request.getReviewId()));
        }

        PerformanceGoal goal = PerformanceGoal.builder()
                .employee(employee)
                .review(review)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : GoalCategory.GENERAL)
                .targetValue(request.getTargetValue())
                .weight(request.getWeight() != null ? request.getWeight() : BigDecimal.ZERO)
                .status(GoalStatus.NOT_STARTED)
                .dueDate(request.getDueDate())
                .build();

        PerformanceGoal saved = goalRepository.save(goal);
        log.info("Goal created for {}: {}", employee.getEmployeeId(), saved.getTitle());

        return ApiResponse.success("Goal created successfully", mapGoalResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<PerformanceGoalResponse> updateGoalProgress(UUID goalId, String achievedValue, GoalStatus status) {
        PerformanceGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceGoal", "id", goalId));

        if (achievedValue != null) goal.setAchievedValue(achievedValue);
        if (status != null) {
            goal.setStatus(status);
            if (status == GoalStatus.COMPLETED) {
                goal.setCompletedAt(LocalDateTime.now());
            }
        }

        PerformanceGoal saved = goalRepository.save(goal);
        log.info("Goal {} updated: status={}", goalId, status);

        return ApiResponse.success("Goal updated", mapGoalResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<PerformanceGoalResponse> scoreGoal(UUID goalId, BigDecimal selfScore, BigDecimal managerScore) {
        PerformanceGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceGoal", "id", goalId));

        if (selfScore != null) goal.setSelfScore(selfScore);
        if (managerScore != null) goal.setManagerScore(managerScore);

        PerformanceGoal saved = goalRepository.save(goal);
        return ApiResponse.success("Goal scored", mapGoalResponse(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PerformanceGoalResponse>> getGoalsByEmployee(UUID employeeId) {
        List<PerformanceGoalResponse> goals = goalRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::mapGoalResponse).collect(Collectors.toList());
        return ApiResponse.success(goals);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PerformanceGoalResponse>> getGoalsByReview(UUID reviewId) {
        List<PerformanceGoalResponse> goals = goalRepository.findByReviewId(reviewId)
                .stream().map(this::mapGoalResponse).collect(Collectors.toList());
        return ApiResponse.success(goals);
    }

    // ========================= MAPPERS =========================

    private PerformanceReviewResponse mapReviewResponse(PerformanceReview r) {
        List<PerformanceGoalResponse> goals = goalRepository.findByReviewId(r.getId())
                .stream().map(this::mapGoalResponse).collect(Collectors.toList());

        return PerformanceReviewResponse.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getFullName())
                .employeeCode(r.getEmployee().getEmployeeId())
                .departmentName(r.getEmployee().getDepartment() != null
                        ? r.getEmployee().getDepartment().getName() : null)
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getFullName())
                .reviewPeriod(r.getReviewPeriod())
                .year(r.getYear())
                .overallRating(r.getOverallRating())
                .selfRating(r.getSelfRating())
                .managerRating(r.getManagerRating())
                .strengths(r.getStrengths())
                .improvements(r.getImprovements())
                .managerComments(r.getManagerComments())
                .employeeComments(r.getEmployeeComments())
                .status(r.getStatus())
                .dueDate(r.getDueDate())
                .completedAt(r.getCompletedAt())
                .goals(goals)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private PerformanceGoalResponse mapGoalResponse(PerformanceGoal g) {
        return PerformanceGoalResponse.builder()
                .id(g.getId())
                .employeeId(g.getEmployee().getId())
                .employeeName(g.getEmployee().getFullName())
                .reviewId(g.getReview() != null ? g.getReview().getId() : null)
                .title(g.getTitle())
                .description(g.getDescription())
                .category(g.getCategory())
                .targetValue(g.getTargetValue())
                .achievedValue(g.getAchievedValue())
                .weight(g.getWeight())
                .selfScore(g.getSelfScore())
                .managerScore(g.getManagerScore())
                .status(g.getStatus())
                .dueDate(g.getDueDate())
                .completedAt(g.getCompletedAt())
                .createdAt(g.getCreatedAt())
                .build();
    }

    private PagedResponse<PerformanceReviewResponse> buildPagedResponse(Page<PerformanceReview> page) {
        List<PerformanceReviewResponse> content = page.getContent().stream()
                .map(this::mapReviewResponse).collect(Collectors.toList());
        return PagedResponse.<PerformanceReviewResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
