package com.nexushr.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutiveDashboardResponse {
    private int workforceHealthScore;
    private int activeUsers;
    private int totalHeadcount;
    private double attritionRate;
    private List<DepartmentHeat> attritionHeatmap;
    private List<PredictiveMetric> predictiveMetrics;
    private List<RecentActivityItem> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentHeat {
        private String department;
        private int riskLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictiveMetric {
        private String subject;
        private Map<String, Integer> departmentScores;
        private int fullMark;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityItem {
        private String id;
        private String user;
        private String action;
        private String time;
        private String type;
    }
}
