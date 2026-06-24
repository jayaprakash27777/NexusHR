package com.nexushr.employee.security;

import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component("employeeSecurity")
@RequiredArgsConstructor
public class EmployeeSecurity {

    private final EmployeeRepository employeeRepository;

    public boolean isSelf(UUID employeeId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails)) {
            return false;
        }
        org.springframework.security.core.userdetails.UserDetails userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        
        return employeeRepository.findById(employeeId)
                .map(Employee::getUser)
                .map(user -> user.getEmail().equals(username))
                .orElse(false);
    }
}
