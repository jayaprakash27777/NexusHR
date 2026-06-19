package com.nexushr.employee.model;

import com.nexushr.common.entity.BaseEntity;
import com.nexushr.department.model.Department;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploymentHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "previous_designation", length = 100)
    private String previousDesignation;

    @Column(name = "new_designation", length = 100)
    private String newDesignation;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;
}
