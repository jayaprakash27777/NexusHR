package com.nexushr.attendance.controller;

import com.nexushr.attendance.dto.ShiftDto;
import com.nexushr.attendance.service.ShiftService;
import com.nexushr.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/shifts")
@RequiredArgsConstructor
@Tag(name = "Shifts", description = "Shift management API")
public class ShiftController {

    private final ShiftService shiftService;

    @GetMapping
    @Operation(summary = "Get all shifts")
    public ResponseEntity<ApiResponse<List<ShiftDto>>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shift by id")
    public ResponseEntity<ApiResponse<ShiftDto>> getShift(@PathVariable UUID id) {
        return ResponseEntity.ok(shiftService.getShift(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create shift")
    public ResponseEntity<ApiResponse<ShiftDto>> createShift(@RequestBody ShiftDto shiftDto) {
        return ResponseEntity.ok(shiftService.createShift(shiftDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update shift")
    public ResponseEntity<ApiResponse<ShiftDto>> updateShift(@PathVariable UUID id, @RequestBody ShiftDto shiftDto) {
        return ResponseEntity.ok(shiftService.updateShift(id, shiftDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete shift")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable UUID id) {
        return ResponseEntity.ok(shiftService.deleteShift(id));
    }

    @PostMapping("/{id}/assign/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Assign shift to employee")
    public ResponseEntity<ApiResponse<Void>> assignShift(@PathVariable UUID id, @PathVariable UUID employeeId) {
        return ResponseEntity.ok(shiftService.assignShiftToEmployee(id, employeeId));
    }
}
