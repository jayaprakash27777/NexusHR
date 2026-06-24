package com.nexushr.auth.controller;

import com.nexushr.auth.dto.CreateDelegationRequest;
import com.nexushr.auth.dto.DelegationDto;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth/delegations")
@RequiredArgsConstructor
@Tag(name = "Delegation Management", description = "Endpoints for managing temporary role or permission delegations")
public class DelegationController {

    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping
    @RequirePermission(category = PermissionCategory.ROLES, action = "READ")
    @Operation(summary = "List Delegations")
    public ApiResponse<PagedResponse<DelegationDto>> getDelegations(
            @RequestParam(required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startDate").descending());
        return ApiResponse.success(authorizationAdminService.getDelegations(userId, pageable));
    }

    @PostMapping("/me")
    @RequirePermission(category = PermissionCategory.ROLES, action = "CREATE")
    @AuditAction(action = "CREATE_DELEGATION", entityType = "Delegation", entityIdExpression = "#result.data.id")
    @Operation(summary = "Create Delegation (Self)")
    public ApiResponse<DelegationDto> createDelegation(Authentication authentication, @Valid @RequestBody CreateDelegationRequest request) {
        // Need to extract delegator UUID. We can rely on a utility or fetch from user service, 
        // but for now we expect the service to fetch by email, or we'd resolve it here.
        // Assuming we resolve delegatorId in service via authentication name or similar.
        // For simplicity in this demo, let's assume the user service lookup is done inside the service layer, 
        // but our interface expects a UUID. Let's pass null and let the service handle it, or fetch user here.
        // For now, let's just use a placeholder method or require delegatorId explicitly for admins.
        throw new UnsupportedOperationException("Self-delegation requires User ID resolution.");
    }

    @PostMapping("/admin/{delegatorId}")
    @RequirePermission(category = PermissionCategory.ROLES, action = "CREATE")
    @AuditAction(action = "CREATE_DELEGATION", entityType = "Delegation", entityIdExpression = "#result.data.id")
    @Operation(summary = "Create Delegation (Admin)")
    public ApiResponse<DelegationDto> createDelegationAdmin(@PathVariable UUID delegatorId, @Valid @RequestBody CreateDelegationRequest request) {
        return ApiResponse.success(authorizationAdminService.createDelegation(delegatorId, request));
    }

    @PutMapping("/{delegationId}/revoke")
    @RequirePermission(category = PermissionCategory.ROLES, action = "UPDATE")
    @AuditAction(action = "REVOKE_DELEGATION", entityType = "Delegation", entityIdExpression = "#delegationId")
    @Operation(summary = "Revoke Delegation")
    public ApiResponse<Void> revokeDelegation(@PathVariable UUID delegationId) {
        authorizationAdminService.revokeDelegation(delegationId);
        return ApiResponse.success("Delegation revoked successfully");
    }
}
