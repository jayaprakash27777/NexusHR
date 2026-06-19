package com.nexushr.enterprise.planning.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CompensationCycleDto {
    private UUID id;
    private String name;
    private Integer fiscalYear;
    private BigDecimal totalBudget;
    private String status;
}
