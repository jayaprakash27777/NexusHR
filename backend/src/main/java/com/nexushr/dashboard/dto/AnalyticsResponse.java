package com.nexushr.dashboard.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    // Headcount analytics
    private long totalHeadcount;
    private long activeHeadcount;
    private double attritionRate;
    private Map<String, Long> headcountByDepartment;
    private Map<String, Long> headcountByDesignation;
    private List<MonthlyHeadcount> headcountTrend;

    // Salary analytics
    private BigDecimal averageSalary;
    private BigDecimal medianSalary;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private BigDecimal totalMonthlyCost;
    private Map<String, BigDecimal> avgSalaryByDepartment;
    private Map<String, BigDecimal> avgSalaryByDesignation;

    // Attendance analytics
    private double overallAttendanceRate;
    private Map<String, Double> attendanceByDepartment;
    private List<DailyAttendance> dailyAttendanceTrend;

    // Leave analytics
    private Map<String, Long> leavesByType;
    private Map<String, Long> leavesByStatus;
    private double avgLeavesPerEmployee;

    // Performance analytics
    private double avgPerformanceRating;
    private Map<String, Double> performanceByDepartment;
    private Map<String, Long> ratingDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyHeadcount {
        private String month;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyAttendance {
        private String date;
        private long present;
        private long absent;
        private double rate;
    }
}
