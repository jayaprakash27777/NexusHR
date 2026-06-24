package com.nexushr.recruitment.service;

import com.nexushr.recruitment.model.RecruitmentAuditLog;
import com.nexushr.recruitment.repository.RecruitmentAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecruitmentAuditService {

    private final RecruitmentAuditLogRepository auditLogRepository;

    public void logAction(String entityType, UUID entityId, String action, String details) {
        String username = "System";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            username = auth.getName();
        }

        RecruitmentAuditLog log = RecruitmentAuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .actionBy(username)
                .details(details)
                .build();
        
        auditLogRepository.save(log);
    }
}
