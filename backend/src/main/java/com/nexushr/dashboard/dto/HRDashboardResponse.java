package com.nexushr.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class HRDashboardResponse {
    private long totalHeadcount;
    private long headcountChangeThisMonth;
    private long openRequisitions;
    private long urgentRequisitions;
    private double attritionRate;
    private double attritionRateChange;
    private long avgTimeToFillDays;
    
    // New KPI fields
    private long newHiresThisMonth;
    private long employeesOnProbation;
    private long pendingApprovals;
    private long pendingDocuments;
    private long attendanceIssues;
    
    // Data collections
    private List<RecentHireDto> recentHires;
    private List<ActiveRequisitionDto> activeRequisitions;
    private Map<String, Long> headcountTrend;
    private Map<String, Long> departmentHeadcount;
    private Map<String, Long> genderDistribution;
    private Map<String, Long> leaveStats;
    private Map<String, Long> employeesByStatus;

    @Data
    @Builder
    public static class RecentHireDto {
        private String name;
        private String role;
        private String department;
        private String startDate;
        private String status;
    }

    @Data
    @Builder
    public static class ActiveRequisitionDto {
        private String title;
        private String department;
        private long candidates;
        private String stage;
        private int progressPercentage;
    }
}
