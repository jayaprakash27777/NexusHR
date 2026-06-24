package com.nexushr.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

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
    
    private List<RecentHireDto> recentHires;
    private List<ActiveRequisitionDto> activeRequisitions;
    private java.util.Map<String, Long> headcountTrend;

    @Data
    @Builder
    public static class RecentHireDto {
        private String name;
        private String role;
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
