package com.nexushr.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private UUID userId;
    private String userName;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private String sourceModule;
    private UUID tenantId;
    private String severity;
    private String beforeState;
    private String afterState;
    private LocalDateTime createdAt;
}
