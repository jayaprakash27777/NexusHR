package com.nexushr.auth.service;

import com.nexushr.auth.dto.*;
import com.nexushr.auth.model.*;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.model.enums.RoleType;
import com.nexushr.auth.repository.*;
import com.nexushr.common.audit.AuditLog;
import com.nexushr.common.audit.AuditLogRepository;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorizationAdminServiceImpl implements AuthorizationAdminService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final DelegationRepository delegationRepository;
    private final ApprovalMatrixRepository approvalMatrixRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RoleDto> getRoles(UUID tenantId, Pageable pageable) {
        Page<Role> page;
        if (tenantId != null) {
            page = roleRepository.findByTenantId(tenantId, pageable);
        } else {
            page = roleRepository.findAll(pageable);
        }
        return buildPagedResponse(page.map(this::mapToRoleDto));
    }

    @Override
    @Transactional
    public RoleDto createRole(CreateRoleRequest request) {
        Role parent = null;
        if (request.getParentRoleId() != null) {
            parent = roleRepository.findById(request.getParentRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getParentRoleId()));
        }

        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .description(request.getDescription())
                .roleType(RoleType.CUSTOM)
                .parentRole(parent)
                .isSystem(false)
                .build();

        return mapToRoleDto(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleDto updateRole(Long roleId, CreateRoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        if (role.isSystem()) {
            throw new BadRequestException("System roles cannot be modified");
        }

        role.setDescription(request.getDescription());
        
        if (request.getParentRoleId() != null && !request.getParentRoleId().equals(role.getParentRole() != null ? role.getParentRole().getId() : null)) {
            Role parent = roleRepository.findById(request.getParentRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getParentRoleId()));
            role.setParentRole(parent);
        }

        return mapToRoleDto(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        if (role.isSystem()) {
            throw new BadRequestException("System roles cannot be deleted");
        }

        role.setDeletedAt(LocalDateTime.now());
        roleRepository.save(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDto> getRoleHierarchy(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
        
        java.util.List<Role> hierarchy = new java.util.ArrayList<>();
        Role current = role;
        while (current != null) {
            hierarchy.add(current);
            current = current.getParentRole();
        }
        
        return hierarchy.stream()
                .map(this::mapToRoleDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignPermissionsToRole(Long roleId, AssignPermissionsRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        if (role.isSystem()) {
            throw new BadRequestException("Permissions of system roles cannot be modified");
        }

        List<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds());
        
        for (Permission permission : permissions) {
            boolean exists = role.getRolePermissions().stream()
                    .anyMatch(rp -> rp.getPermission().getId().equals(permission.getId()));
                    
            if (!exists) {
                RolePermission rp = RolePermission.builder()
                        .id(new RolePermissionKey(role.getId(), permission.getId()))
                        .role(role)
                        .permission(permission)
                        .assignedAt(LocalDateTime.now())
                        .build();
                role.getRolePermissions().add(rp);
            }
        }
        roleRepository.save(role);
    }

    @Override
    @Transactional
    public void revokePermissionFromRole(Long roleId, UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        if (role.isSystem()) {
            throw new BadRequestException("Permissions of system roles cannot be modified");
        }

        role.getRolePermissions().removeIf(rp -> rp.getPermission().getId().equals(permissionId));
        roleRepository.save(role);
    }

    @Override
    @Transactional
    public void assignRoleToUser(UUID userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        boolean exists = user.getUserRoles().stream()
                .anyMatch(ur -> ur.getRole().getId().equals(roleId));

        if (!exists) {
            UserRole userRole = UserRole.builder()
                    .id(new UserRoleKey(user.getId(), role.getId()))
                    .user(user)
                    .role(role)
                    .assignedAt(LocalDateTime.now())
                    .build();
            user.getUserRoles().add(userRole);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void revokeRoleFromUser(UUID userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        user.getUserRoles().removeIf(ur -> ur.getRole().getId().equals(roleId));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PermissionDto> getPermissions(PermissionCategory category, Pageable pageable) {
        Page<Permission> page;
        if (category != null) {
            page = permissionRepository.findByCategory(category, pageable);
        } else {
            page = permissionRepository.findAll(pageable);
        }
        return buildPagedResponse(page.map(this::mapToPermissionDto));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionCategory> getPermissionCategories() {
        return Arrays.asList(PermissionCategory.values());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DelegationDto> getDelegations(UUID userId, Pageable pageable) {
        Page<Delegation> page = delegationRepository.findAll(pageable); // Can be enhanced with filters
        return buildPagedResponse(page.map(this::mapToDelegationDto));
    }

    @Override
    @Transactional
    public DelegationDto createDelegation(UUID delegatorId, CreateDelegationRequest request) {
        User delegator = userRepository.findById(delegatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", delegatorId));
        User delegatee = userRepository.findById(request.getDelegateeId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getDelegateeId()));

        Role specificRole = null;
        if (request.getRoleId() != null) {
            specificRole = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));
        }

        Delegation delegation = Delegation.builder()
                .delegator(delegator)
                .delegatee(delegatee)
                .status(request.getStatus())
                .role(specificRole)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return mapToDelegationDto(delegationRepository.save(delegation));
    }

    @Override
    @Transactional
    public void revokeDelegation(UUID delegationId) {
        Delegation delegation = delegationRepository.findById(delegationId)
                .orElseThrow(() -> new ResourceNotFoundException("Delegation", "id", delegationId));
        // No REVOKED in DelegationScope, so we just set end date to now
        delegation.setEndDate(LocalDateTime.now());
        delegationRepository.save(delegation);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApprovalMatrixDto> getApprovalMatrices(UUID tenantId, Pageable pageable) {
        Page<ApprovalMatrix> page = approvalMatrixRepository.findAll(pageable); // Should filter by tenant
        return buildPagedResponse(page.map(this::mapToApprovalMatrixDto));
    }

    @Override
    @Transactional
    public ApprovalMatrixDto createApprovalMatrix(CreateApprovalMatrixRequest request, UUID tenantId) {
        Role role = roleRepository.findById(request.getRequiredRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRequiredRoleId()));

        ApprovalMatrix matrix = ApprovalMatrix.builder()
                .tenantId(tenantId)
                .category(request.getCategory())
                .action(request.getAction().toUpperCase())
                .approvalLevel(request.getApprovalLevel())
                .requiredRole(role)
                .build();

        return mapToApprovalMatrixDto(approvalMatrixRepository.save(matrix));
    }

    @Override
    @Transactional
    public void deleteApprovalMatrix(UUID matrixId) {
        approvalMatrixRepository.deleteById(matrixId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogDto> getAuditLogs(UUID userId, String action, String entityType,
                                                   String sourceModule, String severity,
                                                   String fromDate, String toDate, Pageable pageable) {
        Specification<AuditLog> spec = Specification.where(null);
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }
        if (action != null && !action.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("action"), action));
        }
        if (entityType != null && !entityType.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityType"), entityType));
        }
        if (sourceModule != null && !sourceModule.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("sourceModule"), sourceModule));
        }
        if (severity != null && !severity.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
        }
        if (fromDate != null && !fromDate.isEmpty()) {
            try {
                LocalDateTime start = LocalDateTime.parse(fromDate + "T00:00:00");
                spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            } catch (Exception ignored) {}
        }
        if (toDate != null && !toDate.isEmpty()) {
            try {
                LocalDateTime end = LocalDateTime.parse(toDate + "T23:59:59");
                spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), end));
            } catch (Exception ignored) {}
        }
        
        Page<AuditLog> page = auditLogRepository.findAll(spec, pageable);
        return buildPagedResponse(page.map(this::mapToAuditLogDto));
    }

    @Override
    @Transactional(readOnly = true)
    public AccessPreviewDto previewUserAccess(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<String> effectiveRoles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toList());

        List<String> effectivePermissions = user.getUserRoles().stream()
                .flatMap(ur -> ur.getRole().getRolePermissions().stream())
                .map(rp -> rp.getPermission().getCategory().name() + ":" + rp.getPermission().getAction())
                .distinct()
                .collect(Collectors.toList());

        List<DelegationDto> activeDelegations = delegationRepository.findActiveDelegationsForDelegatee(userId, LocalDateTime.now()).stream()
                .map(this::mapToDelegationDto)
                .collect(Collectors.toList());

        return AccessPreviewDto.builder()
                .userId(user.getId())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .effectiveRoles(effectiveRoles)
                .effectivePermissions(effectivePermissions)
                .activeDelegations(activeDelegations)
                .build();
    }

    // Mappers
    private RoleDto mapToRoleDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .roleType(role.getRoleType())
                .parentRoleId(role.getParentRole() != null ? role.getParentRole().getId() : null)
                .parentRoleName(role.getParentRole() != null ? role.getParentRole().getName() : null)
                .isSystem(role.isSystem())
                .permissions(role.getRolePermissions().stream()
                        .map(rp -> mapToPermissionDto(rp.getPermission()))
                        .collect(Collectors.toList()))
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }

    private PermissionDto mapToPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .category(permission.getCategory())
                .action(permission.getAction())
                .description(permission.getDescription())
                .build();
    }

    private DelegationDto mapToDelegationDto(Delegation delegation) {
        return DelegationDto.builder()
                .id(delegation.getId())
                .delegatorId(delegation.getDelegator().getId())
                .delegatorName(delegation.getDelegator().getFirstName() + " " + delegation.getDelegator().getLastName())
                .delegateeId(delegation.getDelegatee().getId())
                .delegateeName(delegation.getDelegatee().getFirstName() + " " + delegation.getDelegatee().getLastName())
                .status(delegation.getStatus())
                .roleId(delegation.getRole() != null ? delegation.getRole().getId() : null)
                .roleName(delegation.getRole() != null ? delegation.getRole().getName() : null)
                .startDate(delegation.getStartDate())
                .endDate(delegation.getEndDate())
                .active(delegation.isActive())
                .build();
    }

    private ApprovalMatrixDto mapToApprovalMatrixDto(ApprovalMatrix matrix) {
        return ApprovalMatrixDto.builder()
                .id(matrix.getId())
                .category(matrix.getCategory())
                .action(matrix.getAction())
                .approvalLevel(matrix.getApprovalLevel())
                .requiredRoleId(matrix.getRequiredRole().getId())
                .requiredRoleName(matrix.getRequiredRole().getName())
                .build();
    }

    private AuditLogDto mapToAuditLogDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .sessionId(log.getSessionId())
                .sourceModule(log.getSourceModule())
                .tenantId(log.getTenantId())
                .severity(log.getSeverity())
                .beforeState(log.getBeforeState())
                .afterState(log.getAfterState())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private <T> PagedResponse<T> buildPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
