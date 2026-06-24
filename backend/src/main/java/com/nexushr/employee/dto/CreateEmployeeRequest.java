package com.nexushr.employee.dto;

import jakarta.validation.constraints.*;
import com.nexushr.employee.model.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;

    private String avatarUrl;

    private LocalDate dateOfBirth;

    @Size(max = 20)
    private String gender;

    @Size(max = 1000)
    private String address;

    @Size(max = 1000)
    private String permanentAddress;

    private EmploymentType employmentType;

    private UUID departmentId;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @DecimalMin(value = "0.0", message = "Salary must be non-negative")
    private BigDecimal salary;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private UUID managerId;

    private boolean createUserAccount;

    @Size(max = 50)
    private String roleName;

    @Size(max = 20)
    private String panNumber;

    @Size(max = 50)
    private String pfNumber;

    @Size(max = 50)
    private String esiNumber;

    @Size(max = 20)
    private String uanNumber;
}
