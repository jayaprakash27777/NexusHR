package com.nexushr.performance.dto;

import com.nexushr.performance.model.ReviewPeriod;
import com.nexushr.performance.model.ReviewStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReviewResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private UUID reviewerId;
    private String reviewerName;
    private ReviewPeriod reviewPeriod;
    private int year;
    private BigDecimal overallRating;
    private BigDecimal selfRating;
    private BigDecimal managerRating;
    private String strengths;
    private String improvements;
    private String managerComments;
    private String employeeComments;
    private ReviewStatus status;
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private List<PerformanceGoalResponse> goals;
    private LocalDateTime createdAt;
}
