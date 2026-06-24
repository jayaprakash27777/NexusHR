package com.nexushr.dashboard.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardResponse {

    // Team overview
    private long teamSize;
    private long activeTeamMembers;
    private String departmentName;

    // Team attendance today
    private long teamPresentToday;
    private long teamAbsentToday;
    private double teamAttendanceRate;

    // Leave management
    private long pendingLeaveApprovals;
    private long approvedLeavesThisMonth;

    // Performance
    private long pendingPerformanceReviews;
    private double teamAvgPerformanceRating;
    private long goalsInProgress;
    private long goalsCompleted;

    // Team members quick view
    private List<TeamMemberSummary> teamMembers;
    
    // Dynamic lists
    private List<ApprovalActionDto> pendingActions;
    private List<TeamScheduleDto> teamSchedule;
    private java.util.Map<String, Long> leaveTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberSummary {
        private String employeeId;
        private String name;
        private String designation;
        private String status;
        private boolean presentToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalActionDto {
        private String id;
        private String employeeName;
        private String type;
        private String details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamScheduleDto {
        private String day;
        private long presentCount;
        private long absentCount;
        private long leaveCount;
    }
}
