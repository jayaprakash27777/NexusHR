package com.nexushr.enterprise.release.controller;

import com.nexushr.auth.model.User;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.enterprise.release.dto.ReleaseNoteRequest;
import com.nexushr.enterprise.release.dto.ReleaseNoteResponse;
import com.nexushr.enterprise.release.service.ReleaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/releases")
@RequiredArgsConstructor
@Tag(name = "Release Notes", description = "Release notes management")
public class ReleaseController {

    private final ReleaseService service;

    @GetMapping
    @Operation(summary = "List all release notes with optional search and filter")
    public ResponseEntity<ApiResponse<PagedResponse<ReleaseNoteResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(search, published, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single release note by ID")
    public ResponseEntity<ApiResponse<ReleaseNoteResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @GetMapping("/version/{version}")
    @Operation(summary = "Get a single release note by version")
    public ResponseEntity<ApiResponse<ReleaseNoteResponse>> getByVersion(@PathVariable String version) {
        return ResponseEntity.ok(ApiResponse.success(service.getByVersion(version)));
    }

    @PostMapping
    @Operation(summary = "Create a new release note")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<ReleaseNoteResponse>> create(
            @Valid @RequestBody ReleaseNoteRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Release note created", service.create(request, user.getId())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a release note")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<ReleaseNoteResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ReleaseNoteRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Release note updated", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a release note")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Release note deleted"));
    }
}
