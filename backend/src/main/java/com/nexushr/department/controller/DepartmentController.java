package com.nexushr.department.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.department.dto.DepartmentRequest;
import com.nexushr.department.dto.DepartmentResponse;
import com.nexushr.department.service.DepartmentService;
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
@RequestMapping("/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management endpoints")
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create department", description = "Creates a new department (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> create(
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update department", description = "Updates an existing department (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.update(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(departmentService.getById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get department by code")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(departmentService.getByCode(code));
    }

    @GetMapping
    @Operation(summary = "Get all active departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAll() {
        return ResponseEntity.ok(departmentService.getAll());
    }

    @GetMapping("/paged")
    @Operation(summary = "Get departments with pagination")
    public ResponseEntity<PagedResponse<DepartmentResponse>> getAllPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(departmentService.getAllPaged(page, size, sortBy, direction));
    }

    @GetMapping("/search")
    @Operation(summary = "Search departments", description = "Search by name or code")
    public ResponseEntity<PagedResponse<DepartmentResponse>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(departmentService.search(query, page, size));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete department", description = "Soft deletes a department (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        return ResponseEntity.ok(departmentService.delete(id));
    }

    @PatchMapping("/{id}/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign manager to department", description = "Assigns an employee as department manager (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> assignManager(
            @PathVariable UUID id,
            @PathVariable UUID managerId) {
        return ResponseEntity.ok(departmentService.assignManager(id, managerId));
    }
}
