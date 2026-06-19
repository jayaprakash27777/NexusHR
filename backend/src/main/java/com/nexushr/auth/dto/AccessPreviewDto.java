package com.nexushr.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessPreviewDto {
    private UUID userId;
    private String fullName;
    private String email;
    private List<String> effectiveRoles;
    private List<String> effectivePermissions;
    private List<DelegationDto> activeDelegations;
}
