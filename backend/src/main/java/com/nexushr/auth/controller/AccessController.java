package com.nexushr.auth.controller;

import com.nexushr.auth.dto.AccessPreviewDto;
import com.nexushr.auth.model.enums.PermissionCategory;
import com.nexushr.auth.service.AuthorizationAdminService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.security.annotations.RequirePermission;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth/access")
@RequiredArgsConstructor
@Tag(name = "Access Preview", description = "Endpoints for previewing and debugging effective access")
public class AccessController {

    private final AuthorizationAdminService authorizationAdminService;

    @GetMapping("/preview/{userId}")
    @RequirePermission(category = PermissionCategory.USERS, action = "READ")
    @Operation(summary = "Preview User Access", description = "View the exact flattened list of inherited and delegated permissions for a user")
    public ApiResponse<AccessPreviewDto> previewAccess(@PathVariable UUID userId) {
        return ApiResponse.success(authorizationAdminService.previewUserAccess(userId));
    }
}
