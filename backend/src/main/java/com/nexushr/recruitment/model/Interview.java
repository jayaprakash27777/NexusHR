package com.nexushr.recruitment.model;

import com.nexushr.common.entity.BaseEntity;
import com.nexushr.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private Employee interviewer;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    @Builder.Default
    private String status = "SCHEDULED";

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Integer rating;
}
