package com.nexushr.payroll.model;

import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "salary_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "basic_salary", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(name = "hra_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal hraPercentage = BigDecimal.ZERO;

    @Column(name = "da_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal daPercentage = BigDecimal.ZERO;

    @Column(name = "pf_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pfPercentage = BigDecimal.ZERO;

    @Column(name = "other_allowances", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
