package com.nexushr.common.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import com.nexushr.common.tenant.TenantContextHolder;

import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(UUID userId, String action, String entityType, String entityId, String details) {
        logFull(userId, action, entityType, entityId, details, null, null, null, null, "INFO");
    }

    @Async
    public void logFull(UUID userId, String action, String entityType, String entityId, String details,
                        String sourceModule, String beforeState, String afterState, UUID tenantId, String severity) {
        try {
            String ipAddress = null;
            String userAgent = null;
            String sessionId = null;

            try {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    ipAddress = request.getHeader("X-Forwarded-For");
                    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                        ipAddress = request.getRemoteAddr();
                    }
                    userAgent = request.getHeader("User-Agent");
                    sessionId = request.getRequestedSessionId();
                }
            } catch (Exception e) {
                log.trace("Could not extract request attributes for audit log", e);
            }

            UUID finalTenantId = tenantId != null ? tenantId : TenantContextHolder.getTenantId();

            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .sessionId(sessionId)
                    .sourceModule(sourceModule)
                    .tenantId(finalTenantId)
                    .severity(severity != null ? severity : "INFO")
                    .beforeState(beforeState)
                    .afterState(afterState)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: {} - {} - {}", action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    @Async
    public void log(String action, String entityType, String entityId, String details) {
        log(null, action, entityType, entityId, details);
    }

    @Async
    public void logWithIp(UUID userId, String action, String entityType,
                          String entityId, String details, String ipAddress) {
        logFull(userId, action, entityType, entityId, details, null, null, null, null, "INFO");
    }
}
