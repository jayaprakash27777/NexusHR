package com.nexushr.performance.dto;

import com.nexushr.performance.model.GoalCategory;
import com.nexushr.performance.model.GoalStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceGoalResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private UUID reviewId;
    private String title;
    private String description;
    private GoalCategory category;
    private String targetValue;
    private String achievedValue;
    private BigDecimal weight;
    private BigDecimal selfScore;
    private BigDecimal managerScore;
    private GoalStatus status;
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
