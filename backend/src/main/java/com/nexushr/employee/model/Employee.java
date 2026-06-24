package com.nexushr.employee.model;

import com.nexushr.auth.model.User;
import com.nexushr.common.entity.BaseEntity;
import com.nexushr.department.model.Department;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Column(name = "employee_id", nullable = false, unique = true, length = 20)
    private String employeeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private com.nexushr.attendance.model.Shift shift;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "permanent_address", columnDefinition = "TEXT")
    private String permanentAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 100)
    private String designation;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal salary = BigDecimal.ZERO;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "ifsc_code", length = 20)
    private String ifscCode;

    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "pf_number", length = 50)
    private String pfNumber;

    @Column(name = "esi_number", length = 50)
    private String esiNumber;

    @Column(name = "uan_number", length = 20)
    private String uanNumber;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "INR";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
