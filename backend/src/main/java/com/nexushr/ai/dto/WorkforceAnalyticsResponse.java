package com.nexushr.ai.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkforceAnalyticsResponse {

    private long totalEmployees;
    private long activeEmployees;
    private long onNoticeEmployees;
    private long terminatedEmployees;
    private BigDecimal averageSalary;
    private BigDecimal totalPayroll;

    private Map<String, Long> employeesByDepartment;
    private Map<String, Long> employeesByStatus;
    private Map<String, BigDecimal> avgSalaryByDepartment;
    private Map<String, Double> attendanceByDepartment;

    private double overallAttendanceRate;
    private long pendingLeaveRequests;
    private long pendingPerformanceReviews;
    private double averagePerformanceRating;

    private List<AiInsightResponse> topInsights;
}
