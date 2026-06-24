package com.nexushr.auth.controller;

import com.nexushr.auth.dto.AuditLogDto;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.service.AuthorizationAdminService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.security.annotations.RequirePermission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Endpoints for viewing security and audit logs")
public class AuditLogController {

    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping
    @RequirePermission(category = PermissionCategory.AUDIT, action = "READ")
    @Operation(summary = "List Audit Logs")
    public ApiResponse<PagedResponse<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String sourceModule,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.success(authorizationAdminService.getAuditLogs(
                userId, action, entityType, sourceModule, severity, fromDate, toDate, pageable));
    }
}
