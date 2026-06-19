package com.nexushr.performance.model;

import com.nexushr.common.entity.BaseEntity;
import com.nexushr.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_reviews",
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "review_period", "year"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_period", nullable = false, length = 50)
    private ReviewPeriod reviewPeriod;

    @Column(nullable = false)
    private int year;

    @Column(name = "overall_rating", precision = 3, scale = 1)
    private BigDecimal overallRating;

    @Column(name = "self_rating", precision = 3, scale = 1)
    private BigDecimal selfRating;

    @Column(name = "manager_rating", precision = 3, scale = 1)
    private BigDecimal managerRating;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "manager_comments", columnDefinition = "TEXT")
    private String managerComments;

    @Column(name = "employee_comments", columnDefinition = "TEXT")
    private String employeeComments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
