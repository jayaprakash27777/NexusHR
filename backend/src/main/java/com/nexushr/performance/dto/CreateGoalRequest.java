package com.nexushr.performance.dto;

import com.nexushr.performance.model.GoalCategory;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    private UUID reviewId;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    private GoalCategory category;

    @Size(max = 100)
    private String targetValue;

    @DecimalMin(value = "0", message = "Weight must be non-negative")
    @DecimalMax(value = "100", message = "Weight must not exceed 100")
    private BigDecimal weight;

    private LocalDate dueDate;
}
