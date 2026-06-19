package com.nexushr.performance.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitSelfReviewRequest {

    @DecimalMin(value = "1.0", message = "Self rating must be between 1.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Self rating must be between 1.0 and 5.0")
    private BigDecimal selfRating;

    @Size(max = 2000)
    private String strengths;

    @Size(max = 2000)
    private String improvements;

    @Size(max = 2000)
    private String employeeComments;
}
