package com.nexushr.enterprise.planning.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SuccessionBenchDto {
    private UUID id;
    private UUID roleId;
    private UUID employeeId;
    private String employeeName;
    private String readiness;
    private String flightRisk;
    private Integer rank;
    private String notes;
}
