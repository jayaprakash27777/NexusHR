package com.nexushr.auth.dto;

import com.nexushr.auth.model.enums.RoleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    private Long id;
    private String name;
    private String description;
    private RoleType roleType;
    private Long parentRoleId;
    private String parentRoleName;
    private boolean isSystem;
    private List<PermissionDto> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
