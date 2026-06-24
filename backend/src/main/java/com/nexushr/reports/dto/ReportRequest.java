package com.nexushr.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String reportType; // EMPLOYEE, ATTENDANCE, LEAVE, PAYROLL, RECRUITMENT
    private String format; // CSV, EXCEL, PDF
    private Map<String, Object> filters;
}
