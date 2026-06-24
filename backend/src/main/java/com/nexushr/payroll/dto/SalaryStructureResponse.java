package com.nexushr.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class SalaryStructureResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal basicSalary;
    private BigDecimal hraPercentage;
    private BigDecimal daPercentage;
    private BigDecimal pfPercentage;
    private BigDecimal esiPercentage;
    private BigDecimal otherAllowances;
    private boolean active;
}
