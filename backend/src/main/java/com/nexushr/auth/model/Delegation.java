package com.nexushr.auth.model;

import jakarta.persistence.*;
import lombok.*;

import com.nexushr.auth.model.enums.DelegationScope;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;

@Entity
@Table(name = "delegations")
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delegation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegator_id", nullable = false)
    private User delegator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegatee_id", nullable = false)
    private User delegatee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private DelegationScope status = DelegationScope.FULL_ROLE;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "tenant_id")
    private UUID tenantId;

    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return status == DelegationScope.FULL_ROLE && !now.isBefore(startDate) && !now.isAfter(endDate);
    }
}
