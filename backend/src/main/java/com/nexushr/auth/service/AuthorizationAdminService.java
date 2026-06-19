package com.nexushr.auth.service;

import com.nexushr.auth.dto.*;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.auth.model.enums.PermissionCategory;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AuthorizationAdminService {

    // Roles
    PagedResponse<RoleDto> getRoles(UUID tenantId, Pageable pageable);
    RoleDto createRole(CreateRoleRequest request);
    RoleDto updateRole(Long roleId, CreateRoleRequest request);
    void deleteRole(Long roleId);
    List<RoleDto> getRoleHierarchy(Long roleId);
    
    // Role-Permission
    void assignPermissionsToRole(Long roleId, AssignPermissionsRequest request);
    void revokePermissionFromRole(Long roleId, UUID permissionId);
    
    // User-Role
    void assignRoleToUser(UUID userId, Long roleId);
    void revokeRoleFromUser(UUID userId, Long roleId);

    // Permissions
    PagedResponse<PermissionDto> getPermissions(PermissionCategory category, Pageable pageable);
    List<PermissionCategory> getPermissionCategories();

    // Delegations
    PagedResponse<DelegationDto> getDelegations(UUID userId, Pageable pageable);
    DelegationDto createDelegation(UUID delegatorId, CreateDelegationRequest request);
    void revokeDelegation(UUID delegationId);

    // Approval Matrix
    PagedResponse<ApprovalMatrixDto> getApprovalMatrices(UUID tenantId, Pageable pageable);
    ApprovalMatrixDto createApprovalMatrix(CreateApprovalMatrixRequest request, UUID tenantId);
    void deleteApprovalMatrix(UUID matrixId);

    // Audit Logs
    PagedResponse<AuditLogDto> getAuditLogs(UUID userId, String action, String entityType, 
                                            String sourceModule, String severity, 
                                            String fromDate, String toDate, Pageable pageable);

    // Access Preview
    AccessPreviewDto previewUserAccess(UUID userId);
}
