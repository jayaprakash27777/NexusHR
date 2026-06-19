package com.nexushr.auth.dto;

import com.nexushr.auth.model.enums.DelegationScope;
import com.nexushr.auth.model.enums.PermissionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelegationDto {
    private UUID id;
    private UUID delegatorId;
    private String delegatorName;
    private UUID delegateeId;
    private String delegateeName;
    private DelegationScope status;
    private Long roleId;
    private String roleName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
}
