package com.nexushr.auth.dto;

import com.nexushr.auth.model.enums.PermissionCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateApprovalMatrixRequest {
    @NotNull(message = "Category is required")
    private PermissionCategory category;
    
    @NotBlank(message = "Action is required")
    private String action;
    
    @NotNull(message = "Approval level is required")
    @Min(value = 1, message = "Approval level must be at least 1")
    private Integer approvalLevel;
    
    @NotNull(message = "Required role ID is required")
    private Long requiredRoleId;
}
