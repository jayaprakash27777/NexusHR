package com.nexushr.enterprise.featureflag.model;

import com.nexushr.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Array;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "feature_flags")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeatureFlag extends BaseEntity {

    @Column(name = "flag_key", nullable = false, unique = true, length = 100)
    private String flagKey;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;

    @Column(name = "rollout_percentage")
    private Integer rolloutPercentage = 100;

    @Column(length = 50)
    private String environment = "production";

    @Column(name = "flag_type", length = 20)
    private String flagType = "BOOLEAN";

    @Column(name = "allowed_roles", columnDefinition = "text[]")
    @Array(length = 20)
    private String[] allowedRoles;

    @Column(name = "allowed_tenants", columnDefinition = "text[]")
    @Array(length = 50)
    private String[] allowedTenants;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;
}
