package com.nexushr.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploymentHistoryDto {
    private UUID id;
    private UUID employeeId;
    private UUID departmentId;
    private String departmentName;
    private String previousDesignation;
    private String newDesignation;
    private LocalDate effectiveDate;
    private String changeReason;
}
