package com.nexushr.security;

import com.nexushr.auth.model.ApprovalMatrix;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.repository.ApprovalMatrixRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service("securityContextService")
@RequiredArgsConstructor
public class SecurityContextService {

    private final EmployeeRepository employeeRepository;
    private final ApprovalMatrixRepository approvalMatrixRepository;

    /**
     * Checks if the currently authenticated user is operating on their own employee record.
     */
    public boolean isSelf(Authentication authentication, UUID employeeId) {
        if (authentication == null || employeeId == null) {
            return false;
        }

        String currentUserEmail = authentication.getName();
        Optional<Employee> targetEmployee = employeeRepository.findById(employeeId);

        return targetEmployee.isPresent() && 
               targetEmployee.get().getUser() != null && 
               targetEmployee.get().getUser().getEmail().equalsIgnoreCase(currentUserEmail);
    }

    /**
     * Checks if the currently authenticated user is the direct manager of the target employee.
     */
    public boolean isManagerOf(Authentication authentication, UUID employeeId) {
        if (authentication == null || employeeId == null) {
            return false;
        }

        String currentUserEmail = authentication.getName();
        Optional<Employee> targetEmployee = employeeRepository.findById(employeeId);

        if (targetEmployee.isPresent() && targetEmployee.get().getManager() != null) {
            Employee manager = targetEmployee.get().getManager();
            return manager.getUser() != null && manager.getUser().getEmail().equalsIgnoreCase(currentUserEmail);
        }

        return false;
    }

    /**
     * Checks if the currently authenticated user possesses the correct role to approve a step.
     */
    public boolean canApprove(Authentication authentication, PermissionCategory category, String action, Integer requiredLevel, UUID tenantId) {
        if (authentication == null) {
            return false;
        }

        // Global override for SYSTEM_ADMIN and ROLE_ADMIN
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("SYSTEM_ADMIN"))) {
            return true;
        }

        Optional<ApprovalMatrix> matrixRule = approvalMatrixRepository.findByTenantIdAndCategoryAndActionAndApprovalLevel(
                tenantId, category, action, requiredLevel);

        if (matrixRule.isPresent()) {
            String requiredRoleName = matrixRule.get().getRequiredRole().getName();
            return authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(auth -> auth.equals(requiredRoleName));
        }

        return false;
    }
}
