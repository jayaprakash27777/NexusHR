package com.nexushr.auth.repository;

import com.nexushr.auth.model.ApprovalMatrix;
import com.nexushr.auth.model.enums.PermissionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApprovalMatrixRepository extends JpaRepository<ApprovalMatrix, UUID> {
    
    List<ApprovalMatrix> findByTenantIdAndCategoryAndActionOrderByApprovalLevelAsc(UUID tenantId, PermissionCategory category, String action);
    
    Optional<ApprovalMatrix> findByTenantIdAndCategoryAndActionAndApprovalLevel(UUID tenantId, PermissionCategory category, String action, Integer approvalLevel);
}
