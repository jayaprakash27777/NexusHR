package com.nexushr.payroll.dto;

import com.nexushr.payroll.model.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {

    private UUID id;

    // Employee info
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private String designation;

    // Period
    private int month;
    private int year;

    // Earnings
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal da;
    private BigDecimal otherAllowances;
    private BigDecimal grossSalary;

    // Deductions
    private BigDecimal pfDeduction;
    private BigDecimal professionalTax;
    private BigDecimal incomeTax;
    private BigDecimal otherDeductions;
    private BigDecimal esiDeduction;
    private BigDecimal totalDeductions;

    // Final
    private BigDecimal bonus;
    private BigDecimal netSalary;

    private String currency;

    private PayrollStatus status;
    private LocalDateTime processedAt;
    private LocalDateTime paidAt;
}
