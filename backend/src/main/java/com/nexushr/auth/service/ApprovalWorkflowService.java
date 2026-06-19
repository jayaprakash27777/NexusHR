package com.nexushr.auth.service;

import com.nexushr.auth.model.ApprovalMatrix;
import com.nexushr.auth.model.User;
import com.nexushr.auth.model.WorkflowApprovalStep;
import com.nexushr.auth.model.enums.ApprovalStepStatus;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.repository.ApprovalMatrixRepository;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.auth.repository.WorkflowApprovalStepRepository;
import com.nexushr.department.model.Department;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalWorkflowService {

    private final ApprovalMatrixRepository approvalMatrixRepository;
    private final WorkflowApprovalStepRepository stepRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DelegationExecutionService delegationService;

    /**
     * Generates a multi-step approval chain based on the matrix rules.
     */
    @Transactional
    public List<WorkflowApprovalStep> generateApprovalChain(UUID requesterUserId, String entityId, String entityType, PermissionCategory category, String action, UUID tenantId) {
        Employee requester = employeeRepository.findByUserId(requesterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", requesterUserId));

        List<ApprovalMatrix> rules = approvalMatrixRepository.findByTenantIdAndCategoryAndActionOrderByApprovalLevelAsc(tenantId, category, action);
        
        if (rules.isEmpty()) {
            log.warn("No approval matrix rules found for category: {}, action: {}", category, action);
            return new ArrayList<>();
        }

        List<WorkflowApprovalStep> steps = new ArrayList<>();

        for (ApprovalMatrix rule : rules) {
            String roleName = rule.getRequiredRole().getName();
            User intendedApprover = resolveApproverForRole(requester, roleName);
            
            if (intendedApprover == null) {
                log.warn("Could not resolve approver for role {} for requester {}", roleName, requester.getEmployeeId());
                continue;
            }

            // Delegation Engine intercept
            User effectiveApprover = delegationService.resolveEffectiveApprover(intendedApprover.getId());

            WorkflowApprovalStep step = WorkflowApprovalStep.builder()
                    .entityId(entityId)
                    .entityType(entityType)
                    .stepNumber(rule.getApprovalLevel())
                    .approver(effectiveApprover)
                    .originalApprover(!effectiveApprover.getId().equals(intendedApprover.getId()) ? intendedApprover : null)
                    .status(ApprovalStepStatus.PENDING)
                    .build();

            steps.add(stepRepository.save(step));
        }

        return steps;
    }

    /**
     * Processes an individual step in the workflow
     */
    @Transactional
    public void processApprovalStep(UUID stepId, UUID actioningUserId, ApprovalStepStatus status, String comments) {
        WorkflowApprovalStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowApprovalStep", "id", stepId));

        if (!step.getApprover().getId().equals(actioningUserId)) {
            // Alternatively check if actioning user is a SUPER_ADMIN who can override
            throw new IllegalArgumentException("User is not authorized to action this step");
        }

        step.setStatus(status);
        step.setComments(comments);
        stepRepository.save(step);

        // Here we could emit an event (e.g., WorkflowStepCompletedEvent) 
        // to let the LeaveService or PayrollService know to update the parent entity status if all steps are APPROVED.
    }

    /**
     * Escalation Engine: Daily check for pending approvals older than 3 days
     */
    @Scheduled(cron = "0 0 1 * * ?") // 1 AM every day
    @Transactional
    public void escalateStaleApprovals() {
        log.info("Running escalation engine for stale approvals...");
        LocalDateTime threshold = LocalDateTime.now().minusDays(3);
        List<WorkflowApprovalStep> staleSteps = stepRepository.findByStatusAndCreatedAtBefore(ApprovalStepStatus.PENDING, threshold);

        for (WorkflowApprovalStep step : staleSteps) {
            log.info("Escalating step {} for entity {}", step.getId(), step.getEntityId());
            
            // Look up the current approver's manager
            Employee approverEmployee = employeeRepository.findByUserId(step.getApprover().getId()).orElse(null);
            
            if (approverEmployee != null && approverEmployee.getManager() != null) {
                User escalatedTo = approverEmployee.getManager().getUser();
                step.setOriginalApprover(step.getApprover());
                step.setApprover(escalatedTo);
                step.setStatus(ApprovalStepStatus.ESCALATED);
                step.setComments("Auto-escalated due to 3-day SLA breach.");
                stepRepository.save(step);
            } else {
                log.warn("Cannot escalate step {}; approver has no manager.", step.getId());
            }
        }
    }

    // --- Private Helpers ---

    private User resolveApproverForRole(Employee requester, String roleName) {
        switch (roleName) {
            case "ROLE_MANAGER":
                return (requester.getManager() != null) ? requester.getManager().getUser() : null;
                
            case "ROLE_DEPARTMENT_HEAD":
                Department dept = requester.getDepartment();
                if (dept != null && dept.getManagerId() != null) {
                    return userRepository.findById(dept.getManagerId()).orElse(null);
                }
                return null;
                
            default:
                // For roles like ROLE_PAYROLL_MANAGER, we find the first active user holding that role in the tenant
                // In a multi-tenant DB we'd filter by tenantId, here we just do a quick global search for demo
                List<User> usersWithRole = userRepository.findByRoleName(roleName);
                return usersWithRole.isEmpty() ? null : usersWithRole.get(0);
        }
    }
}
