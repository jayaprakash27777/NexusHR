package com.nexushr.config.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_configurations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfiguration {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "module_id", nullable = false, length = 50)
    private String moduleId;

    @Column(name = "module_name", nullable = false, length = 100)
    private String moduleName;

    @Column(name = "icon_name", nullable = false, length = 50)
    private String iconName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "color_class", length = 50)
    private String colorClass;

    @Column(name = "is_active")
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
