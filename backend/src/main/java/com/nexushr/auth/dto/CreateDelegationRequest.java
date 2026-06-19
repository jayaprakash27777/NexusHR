package com.nexushr.auth.dto;

import com.nexushr.auth.model.enums.DelegationScope;
import com.nexushr.auth.model.enums.PermissionCategory;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
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
public class CreateDelegationRequest {
    @NotNull(message = "Delegatee ID is required")
    private UUID delegateeId;
    
    @NotNull(message = "Status is required")
    private DelegationScope status;
    
    @NotNull(message = "Role ID is required")
    private Long roleId;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;
}
