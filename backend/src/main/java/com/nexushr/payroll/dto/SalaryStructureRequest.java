package com.nexushr.payroll.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalaryStructureRequest {

    @NotBlank(message = "Structure name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Basic salary is required")
    @PositiveOrZero(message = "Basic salary must be zero or positive")
    private BigDecimal basicSalary;

    @NotNull(message = "HRA percentage is required")
    @DecimalMin(value = "0.0", message = "HRA percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "HRA percentage cannot exceed 100")
    private BigDecimal hraPercentage;

    @NotNull(message = "DA percentage is required")
    @DecimalMin(value = "0.0", message = "DA percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "DA percentage cannot exceed 100")
    private BigDecimal daPercentage;

    @NotNull(message = "PF percentage is required")
    @DecimalMin(value = "0.0", message = "PF percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "PF percentage cannot exceed 100")
    private BigDecimal pfPercentage;

    @NotNull(message = "Other allowances is required")
    @PositiveOrZero(message = "Other allowances must be zero or positive")
    private BigDecimal otherAllowances;

    private boolean active = true;
}
