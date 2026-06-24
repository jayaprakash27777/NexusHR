package com.nexushr.recruitment.model;

import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal salary;

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, SENT, ACCEPTED, REJECTED, WITHDRAWN

    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime expiresAt;
}
