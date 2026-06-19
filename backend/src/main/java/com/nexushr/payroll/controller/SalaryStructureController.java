package com.nexushr.payroll.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.payroll.dto.SalaryStructureRequest;
import com.nexushr.payroll.dto.SalaryStructureResponse;
import com.nexushr.payroll.service.SalaryStructureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payroll/structures")
@RequiredArgsConstructor
@Tag(name = "Salary Structure", description = "Manage salary structures")
@PreAuthorize("hasRole('ADMIN')")
public class SalaryStructureController {

    private final SalaryStructureService salaryStructureService;

    @PostMapping
    @Operation(summary = "Create salary structure")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> createStructure(
            @Valid @RequestBody SalaryStructureRequest request) {
        return ResponseEntity.ok(salaryStructureService.createStructure(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update salary structure")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> updateStructure(
            @PathVariable UUID id,
            @Valid @RequestBody SalaryStructureRequest request) {
        return ResponseEntity.ok(salaryStructureService.updateStructure(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete salary structure")
    public ResponseEntity<ApiResponse<Void>> deleteStructure(@PathVariable UUID id) {
        return ResponseEntity.ok(salaryStructureService.deleteStructure(id));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get salary structure by ID")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> getStructureById(@PathVariable UUID id) {
        return ResponseEntity.ok(salaryStructureService.getStructureById(id));
    }

    @GetMapping
    @Operation(summary = "Get all salary structures")
    public ResponseEntity<ApiResponse<List<SalaryStructureResponse>>> getAllStructures() {
        return ResponseEntity.ok(salaryStructureService.getAllStructures());
    }
}
