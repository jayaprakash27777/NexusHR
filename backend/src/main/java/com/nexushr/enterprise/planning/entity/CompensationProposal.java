package com.nexushr.enterprise.planning.entity;

import com.nexushr.employee.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "compensation_proposals")
public class CompensationProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private CompensationCycle cycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "current_salary", nullable = false)
    private BigDecimal currentSalary;

    @Column(name = "proposed_increase")
    private BigDecimal proposedIncrease;

    @Column(name = "proposed_bonus")
    private BigDecimal proposedBonus;

    @Column(name = "performance_score")
    private BigDecimal performanceScore;

    @Column(name = "compa_ratio")
    private BigDecimal compaRatio;

    @Column(name = "band_min")
    private BigDecimal bandMin;

    @Column(name = "band_max")
    private BigDecimal bandMax;

    private String justification;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
