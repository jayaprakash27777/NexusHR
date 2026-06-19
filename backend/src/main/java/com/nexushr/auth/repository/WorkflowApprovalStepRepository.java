package com.nexushr.auth.repository;

import com.nexushr.auth.model.WorkflowApprovalStep;
import com.nexushr.auth.model.enums.ApprovalStepStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowApprovalStepRepository extends JpaRepository<WorkflowApprovalStep, UUID> {
    
    List<WorkflowApprovalStep> findByEntityIdAndEntityTypeOrderByStepNumberAsc(String entityId, String entityType);
    
    List<WorkflowApprovalStep> findByStatusAndCreatedAtBefore(ApprovalStepStatus status, LocalDateTime threshold);
    
    List<WorkflowApprovalStep> findByApproverIdAndStatus(UUID approverId, ApprovalStepStatus status);
}
