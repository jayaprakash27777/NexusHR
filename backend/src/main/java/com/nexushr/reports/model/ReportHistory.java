package com.nexushr.reports.model;

import com.nexushr.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "report_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String reportType; // EMPLOYEE, ATTENDANCE, LEAVE, PAYROLL, RECRUITMENT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generatedBy;

    private String fileUrl;

    @Column(nullable = false)
    private String format; // CSV, EXCEL, PDF

    @Column(columnDefinition = "TEXT")
    private String filtersJson;

    @Column(nullable = false)
    private String status; // PENDING, COMPLETED, FAILED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
