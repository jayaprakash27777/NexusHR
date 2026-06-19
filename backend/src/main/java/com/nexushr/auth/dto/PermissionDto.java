package com.nexushr.auth.dto;

import com.nexushr.auth.model.enums.PermissionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDto {
    private UUID id;
    private PermissionCategory category;
    private String action;
    private String description;
}
