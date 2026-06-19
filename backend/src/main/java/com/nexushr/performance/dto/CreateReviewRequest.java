package com.nexushr.performance.dto;

import com.nexushr.performance.model.ReviewPeriod;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotNull(message = "Reviewer ID is required")
    private UUID reviewerId;

    @NotNull(message = "Review period is required")
    private ReviewPeriod reviewPeriod;

    @NotNull(message = "Year is required")
    @Min(value = 2020)
    private Integer year;

    private LocalDate dueDate;
}
