package com.nexushr.enterprise.featureflag.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.enterprise.featureflag.dto.FeatureFlagRequest;
import com.nexushr.enterprise.featureflag.dto.FeatureFlagResponse;
import com.nexushr.enterprise.featureflag.service.FeatureFlagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/features")
@RequiredArgsConstructor
@Tag(name = "Feature Flags", description = "Feature flag management")
public class FeatureFlagController {

    private final FeatureFlagService service;

    @GetMapping
    @Operation(summary = "List all feature flags with optional search and filter")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PagedResponse<FeatureFlagResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String environment,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(search, environment, page, size)));
    }

    @GetMapping("/enabled")
    @Operation(summary = "Get all enabled flags for a given environment (used by frontend runtime)")
    public ResponseEntity<ApiResponse<List<FeatureFlagResponse>>> getEnabled(
            @RequestParam(defaultValue = "production") String environment
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getEnabledFlags(environment)));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get a single feature flag by its key")
    public ResponseEntity<ApiResponse<FeatureFlagResponse>> getByKey(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.success(service.getByKey(key)));
    }

    @PostMapping
    @Operation(summary = "Create a new feature flag")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeatureFlagResponse>> create(
            @Valid @RequestBody FeatureFlagRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feature flag created", service.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a feature flag")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FeatureFlagResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody FeatureFlagRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Feature flag updated", service.update(id, request)));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle a feature flag on/off")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<FeatureFlagResponse>> toggle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Feature flag toggled", service.toggle(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a feature flag")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Feature flag deleted"));
    }
}
