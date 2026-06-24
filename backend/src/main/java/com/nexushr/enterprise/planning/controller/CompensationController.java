package com.nexushr.enterprise.planning.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.enterprise.planning.dto.CompensationCycleDto;
import com.nexushr.enterprise.planning.dto.CompensationProposalDto;
import com.nexushr.enterprise.planning.service.CompensationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/planning/compensation")
@RequiredArgsConstructor
public class CompensationController {

    private final CompensationService compensationService;

    @GetMapping("/cycles")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HR')")
    public ResponseEntity<ApiResponse<List<CompensationCycleDto>>> getCycles() {
        return ResponseEntity.ok(ApiResponse.success(compensationService.getAllCycles()));
    }

    @GetMapping("/cycles/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HR')")
    public ResponseEntity<ApiResponse<CompensationCycleDto>> getCycle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(compensationService.getCycleById(id)));
    }

    @GetMapping("/cycles/{id}/proposals")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HR')")
    public ResponseEntity<ApiResponse<List<CompensationProposalDto>>> getProposals(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(compensationService.getProposalsByCycle(id)));
    }

    @PutMapping("/proposals/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('HR')")
    public ResponseEntity<ApiResponse<CompensationProposalDto>> updateProposal(
            @PathVariable UUID id, @RequestBody CompensationProposalDto dto) {
        return ResponseEntity.ok(ApiResponse.success(compensationService.updateProposal(id, dto)));
    }
}
