package com.nexushr.enterprise.featureflag.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FeatureFlagRequest {
    @NotBlank(message = "Flag key is required")
    @Pattern(regexp = "^[a-z_][a-z0-9_]*$", message = "Flag key must be lowercase snake_case")
    @Size(max = 100)
    private String flagKey;

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    private String description;

    private boolean enabled = false;

    @Min(0) @Max(100)
    private Integer rolloutPercentage = 100;

    private String environment = "production";

    private String flagType = "BOOLEAN";

    private String[] allowedRoles;

    private OffsetDateTime expiresAt;
}
