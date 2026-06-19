package com.nexushr.auth.controller;

import com.nexushr.auth.dto.AssignPermissionsRequest;
import com.nexushr.auth.dto.CreateRoleRequest;
import com.nexushr.auth.dto.RoleDto;
import com.nexushr.auth.service.AuthorizationAdminService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.security.annotations.AuditAction;
import com.nexushr.security.annotations.RequirePermission;
import com.nexushr.auth.model.enums.PermissionCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth/roles")
@RequiredArgsConstructor
@Tag(name = "Role Management", description = "Endpoints for managing roles and role assignments")
public class RoleController {

    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping
    @RequirePermission(category = PermissionCategory.ROLES, action = "READ")
    @Operation(summary = "List Roles")
    public ApiResponse<PagedResponse<RoleDto>> getRoles(
            @RequestParam(required = false) UUID tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ApiResponse.success(authorizationAdminService.getRoles(tenantId, pageable));
    }

    @PostMapping
    @RequirePermission(category = PermissionCategory.ROLES, action = "CREATE")
    @AuditAction(action = "CREATE_ROLE", entityType = "Role", entityIdExpression = "#result.data.id")
    @Operation(summary = "Create Role")
    public ApiResponse<RoleDto> createRole(@Valid @RequestBody CreateRoleRequest request) {
        return ApiResponse.success(authorizationAdminService.createRole(request));
    }

    @PutMapping("/{roleId}")
    @RequirePermission(category = PermissionCategory.ROLES, action = "UPDATE")
    @AuditAction(action = "UPDATE_ROLE", entityType = "Role", entityIdExpression = "#roleId")
    @Operation(summary = "Update Role")
    public ApiResponse<RoleDto> updateRole(@PathVariable Long roleId, @Valid @RequestBody CreateRoleRequest request) {
        return ApiResponse.success(authorizationAdminService.updateRole(roleId, request));
    }

    @DeleteMapping("/{roleId}")
    @RequirePermission(category = PermissionCategory.ROLES, action = "DELETE")
    @AuditAction(action = "DELETE_ROLE", entityType = "Role", entityIdExpression = "#roleId")
    @Operation(summary = "Delete Role")
    public ApiResponse<Void> deleteRole(@PathVariable Long roleId) {
        authorizationAdminService.deleteRole(roleId);
        return ApiResponse.success("Role deleted successfully");
    }

    @GetMapping("/{roleId}/hierarchy")
    @RequirePermission(category = PermissionCategory.ROLES, action = "READ")
    @Operation(summary = "Get Role Hierarchy")
    public ApiResponse<List<RoleDto>> getRoleHierarchy(@PathVariable Long roleId) {
        return ApiResponse.success(authorizationAdminService.getRoleHierarchy(roleId));
    }

    @PostMapping("/{roleId}/permissions")
    @RequirePermission(category = PermissionCategory.ROLES, action = "UPDATE")
    @AuditAction(action = "ASSIGN_PERMISSIONS", entityType = "Role", entityIdExpression = "#roleId")
    @Operation(summary = "Assign Permissions to Role")
    public ApiResponse<Void> assignPermissionsToRole(@PathVariable Long roleId, @Valid @RequestBody AssignPermissionsRequest request) {
        authorizationAdminService.assignPermissionsToRole(roleId, request);
        return ApiResponse.success("Permissions assigned successfully");
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @RequirePermission(category = PermissionCategory.ROLES, action = "UPDATE")
    @AuditAction(action = "REVOKE_PERMISSION", entityType = "Role", entityIdExpression = "#roleId")
    @Operation(summary = "Revoke Permission from Role")
    public ApiResponse<Void> revokePermissionFromRole(@PathVariable Long roleId, @PathVariable UUID permissionId) {
        authorizationAdminService.revokePermissionFromRole(roleId, permissionId);
        return ApiResponse.success("Permission revoked successfully");
    }

    @PostMapping("/{roleId}/users/{userId}")
    @RequirePermission(category = PermissionCategory.USERS, action = "UPDATE")
    @AuditAction(action = "ASSIGN_ROLE_TO_USER", entityType = "User", entityIdExpression = "#userId")
    @Operation(summary = "Assign Role to User")
    public ApiResponse<Void> assignRoleToUser(@PathVariable Long roleId, @PathVariable UUID userId) {
        authorizationAdminService.assignRoleToUser(userId, roleId);
        return ApiResponse.success("Role assigned to user successfully");
    }

    @DeleteMapping("/{roleId}/users/{userId}")
    @RequirePermission(category = PermissionCategory.USERS, action = "UPDATE")
    @AuditAction(action = "REVOKE_ROLE_FROM_USER", entityType = "User", entityIdExpression = "#userId")
    @Operation(summary = "Revoke Role from User")
    public ApiResponse<Void> revokeRoleFromUser(@PathVariable Long roleId, @PathVariable UUID userId) {
        authorizationAdminService.revokeRoleFromUser(userId, roleId);
        return ApiResponse.success("Role revoked from user successfully");
    }
}
