package com.nexushr.enterprise.featureflag.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FeatureFlagResponse {
    private String id;
    private String flagKey;
    private String name;
    private String description;
    private boolean enabled;
    private Integer rolloutPercentage;
    private String environment;
    private String flagType;
    private String[] allowedRoles;
    private OffsetDateTime expiresAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
