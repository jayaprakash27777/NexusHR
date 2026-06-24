package com.nexushr.auth.controller;

import com.nexushr.auth.dto.ApprovalMatrixDto;
import com.nexushr.auth.dto.CreateApprovalMatrixRequest;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.service.AuthorizationAdminService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.security.annotations.AuditAction;
import com.nexushr.security.annotations.RequirePermission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth/approval-matrix")
@RequiredArgsConstructor
@Tag(name = "Approval Matrix Management", description = "Endpoints for configuring multi-level approval workflows")
public class ApprovalMatrixController {

    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping
    @RequirePermission(category = PermissionCategory.ROLES, action = "READ")
    @Operation(summary = "List Approval Matrix Rules")
    public ApiResponse<PagedResponse<ApprovalMatrixDto>> getApprovalMatrices(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("category").ascending().and(Sort.by("approvalLevel").ascending()));
        return ApiResponse.success(authorizationAdminService.getApprovalMatrices(tenantId, pageable));
    }

    @PostMapping
    @RequirePermission(category = PermissionCategory.ROLES, action = "CREATE")
    @AuditAction(action = "CREATE_APPROVAL_RULE", entityType = "ApprovalMatrix", entityIdExpression = "#result.data.id")
    @Operation(summary = "Create Approval Matrix Rule")
    public ApiResponse<ApprovalMatrixDto> createApprovalMatrix(
            @RequestParam(required = false) UUID tenantId,
            @Valid @RequestBody CreateApprovalMatrixRequest request) {
        return ApiResponse.success(authorizationAdminService.createApprovalMatrix(request, tenantId));
    }

    @DeleteMapping("/{matrixId}")
    @RequirePermission(category = PermissionCategory.ROLES, action = "DELETE")
    @AuditAction(action = "DELETE_APPROVAL_RULE", entityType = "ApprovalMatrix", entityIdExpression = "#matrixId")
    @Operation(summary = "Delete Approval Matrix Rule")
    public ApiResponse<Void> deleteApprovalMatrix(@PathVariable UUID matrixId) {
        authorizationAdminService.deleteApprovalMatrix(matrixId);
        return ApiResponse.success("Approval matrix rule deleted successfully");
    }
}
