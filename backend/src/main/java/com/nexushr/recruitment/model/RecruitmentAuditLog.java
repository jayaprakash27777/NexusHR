package com.nexushr.recruitment.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "recruitment_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String entityType; // CANDIDATE, JOB_POSTING, APPLICATION, INTERVIEW, OFFER

    @Column(nullable = false)
    private UUID entityId;

    @Column(nullable = false)
    private String action; // CREATED, STATUS_CHANGED, SCHEDULED, REJECTED

    @Column(nullable = false)
    private String actionBy;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
