package com.nexushr.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollSummaryResponse {

    private int month;
    private int year;
    private BigDecimal totalGrossSalary;
    private BigDecimal totalNetSalary;
    private BigDecimal totalDeductions;
    private BigDecimal averageSalary;
    private long totalEmployeesProcessed;
    private long totalApproved;
    private long totalLocked;
    private long totalPaid;
    private long totalPending;
    private String currentPayrollCycle;
    private String nextPayrollDate;
}
