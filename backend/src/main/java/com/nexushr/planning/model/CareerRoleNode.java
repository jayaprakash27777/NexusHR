package com.nexushr.planning.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "career_role_nodes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerRoleNode {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "role_level", nullable = false, length = 20)
    private String level;

    @Column(name = "track_type", nullable = false, length = 20)
    private String trackType;

    @Column(name = "base_min", nullable = false)
    private BigDecimal baseMin;

    @Column(name = "base_max", nullable = false)
    private BigDecimal baseMax;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "requirements", columnDefinition = "jsonb")
    private List<String> requirements;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
