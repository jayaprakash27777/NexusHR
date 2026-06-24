package com.nexushr.employee.dto;

import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.model.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private UUID id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String permanentAddress;
    private EmploymentType employmentType;

    // Department info
    private UUID departmentId;
    private String departmentName;
    private String departmentCode;

    private String designation;
    private BigDecimal salary;
    private LocalDate joiningDate;

    // Manager info
    private UUID managerId;
    private String managerName;

    private EmployeeStatus status;
    private boolean hasUserAccount;
    private UUID userId;
    private java.util.List<String> roles;
    private boolean mfaEnabled;
    private LocalDateTime lastLogin;

    private String panNumber;
    private String pfNumber;
    private String esiNumber;
    private String uanNumber;
    private String bankName;
    private String bankAccountNumber;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
