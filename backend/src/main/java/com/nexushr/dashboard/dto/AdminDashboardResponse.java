package com.nexushr.dashboard.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    // Workforce overview
    private long totalEmployees;
    private long activeEmployees;
    private long onNoticeEmployees;
    private long newHiresThisMonth;
    private long totalDepartments;

    // Attendance today
    private long presentToday;
    private long absentToday;
    private double attendanceRateToday;

    // Leave overview
    private long pendingLeaveRequests;
    private long approvedLeavesToday;

    // Payroll
    private BigDecimal currentMonthPayroll;
    private long payrollsPending;
    private long payrollsPaid;

    // Performance
    private long pendingReviews;
    private double averagePerformanceRating;

    // AI Insights
    private long activeInsights;
    private long criticalInsights;

    // Notifications
    private long unreadNotifications;

    // Security
    private long activeSessions;
    private long failedLoginAttempts;
    private long lockedAccounts;

    // Charts data
    private Map<String, Long> employeesByDepartment;
    private Map<String, Long> employeesByStatus;
    private List<MonthlyTrend> attendanceTrend;
    private List<MonthlyTrend> payrollTrend;

    private List<EmployeeSummaryDto> recentlyJoinedEmployees;
    private List<EmployeeSummaryDto> recentlyResignedEmployees;
    private List<EmployeeSummaryDto> employeesOnProbation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend implements Serializable {
        private static final long serialVersionUID = 1L;
        private String month;
        private double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeSummaryDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String id;
        private String employeeId;
        private String name;
        private String email;
        private String department;
        private String designation;
        private String joiningDate;
        private String status;
    }
}
