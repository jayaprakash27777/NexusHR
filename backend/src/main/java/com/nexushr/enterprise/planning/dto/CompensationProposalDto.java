package com.nexushr.enterprise.planning.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CompensationProposalDto {
    private UUID id;
    private UUID cycleId;
    private UUID employeeId;
    private String employeeName;
    private BigDecimal currentSalary;
    private BigDecimal proposedIncrease;
    private BigDecimal proposedBonus;
    private BigDecimal performanceScore;
    private BigDecimal compaRatio;
    private String justification;
}
