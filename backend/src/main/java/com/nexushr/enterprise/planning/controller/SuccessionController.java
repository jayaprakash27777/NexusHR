package com.nexushr.enterprise.planning.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.enterprise.planning.dto.SuccessionBenchDto;
import com.nexushr.enterprise.planning.dto.SuccessionRoleDto;
import com.nexushr.enterprise.planning.service.SuccessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/planning/succession")
@RequiredArgsConstructor
public class SuccessionController {

    private final SuccessionService successionService;

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HR')")
    public ResponseEntity<ApiResponse<List<SuccessionRoleDto>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.success(successionService.getAllRoles()));
    }

    @GetMapping("/roles/{id}/bench")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HR')")
    public ResponseEntity<ApiResponse<List<SuccessionBenchDto>>> getBench(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(successionService.getBenchForRole(id)));
    }
}
