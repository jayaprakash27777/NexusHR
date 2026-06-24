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
public class AuditorDashboardResponse {
    private long totalAuditEvents;
    private long recentSecurityAlerts;
    private long activeSessions;
    private long policyViolations;
    private Map<String, Long> auditEventsByType;
    private List<AuditLogSummary> recentAuditLogs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogSummary {
        private String id;
        private String userId;
        private String action;
        private String entityType;
        private String entityId;
        private String createdAt;
    }
}
