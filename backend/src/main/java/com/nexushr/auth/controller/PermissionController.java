package com.nexushr.auth.controller;

import com.nexushr.auth.dto.PermissionDto;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.service.AuthorizationAdminService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.security.annotations.RequirePermission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission Management", description = "Endpoints for viewing available system permissions")
public class PermissionController {

    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping
    @RequirePermission(category = PermissionCategory.ROLES, action = "READ")
    @Operation(summary = "List Permissions")
    public ApiResponse<PagedResponse<PermissionDto>> getPermissions(
            @RequestParam(required = false) PermissionCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("category").ascending().and(Sort.by("action").ascending()));
        return ApiResponse.success(authorizationAdminService.getPermissions(category, pageable));
    }

    @GetMapping("/categories")
    @RequirePermission(category = PermissionCategory.ROLES, action = "READ")
    @Operation(summary = "List Permission Categories")
    public ApiResponse<List<PermissionCategory>> getPermissionCategories() {
        return ApiResponse.success(authorizationAdminService.getPermissionCategories());
    }
}
