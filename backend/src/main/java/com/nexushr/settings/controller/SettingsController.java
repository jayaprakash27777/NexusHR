package com.nexushr.settings.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.settings.model.OrganizationSetting;
import com.nexushr.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<OrganizationSetting>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getAllSettings()));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<OrganizationSetting>>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getPublicSettings()));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationSetting>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.updateSetting(key, payload.get("value"))));
    }
}
