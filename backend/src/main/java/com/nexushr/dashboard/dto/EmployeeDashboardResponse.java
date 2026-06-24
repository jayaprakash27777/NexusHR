package com.nexushr.dashboard.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardResponse {

    // Profile summary
    private String employeeId;
    private String name;
    private String department;
    private String designation;

    // Today's attendance
    private String attendanceStatus;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private BigDecimal workHoursToday;

    // Monthly attendance
    private long presentDaysThisMonth;
    private long totalWorkingDaysThisMonth;
    private double attendancePercentage;

    // Leave balances
    private List<LeaveBalanceSummary> leaveBalances;
    private long pendingLeaveRequests;

    // Payroll
    private BigDecimal lastMonthNetSalary;
    private String lastPayrollMonth;

    // Performance
    private BigDecimal latestPerformanceRating;
    private long activeGoals;
    private long completedGoals;

    // Notifications
    private long unreadNotifications;

    // Additional dynamic mock lists
    private List<DocumentDto> recentDocuments;
    private List<GoalDto> upcomingGoals;
    private java.util.Map<String, Double> attendanceTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveBalanceSummary {
        private String leaveType;
        private BigDecimal total;
        private BigDecimal used;
        private BigDecimal remaining;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentDto {
        private String name;
        private String date;
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalDto {
        private String title;
        private String progress;
        private String dueDate;
    }
}
