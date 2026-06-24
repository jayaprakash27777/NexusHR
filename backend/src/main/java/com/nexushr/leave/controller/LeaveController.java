package com.nexushr.leave.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.leave.dto.*;
import com.nexushr.leave.model.LeaveStatus;
import com.nexushr.leave.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Leave application and approval endpoints")
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply/{employeeId}")
    @Operation(summary = "Apply for leave", description = "Submit a leave application")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> applyLeave(
            @PathVariable UUID employeeId,
            @Valid @RequestBody LeaveApplyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaveService.applyLeave(employeeId, request));
    }

    @PatchMapping("/{leaveId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Approve leave", description = "Approve a pending leave request (Manager/Admin)")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> approveLeave(
            @PathVariable UUID leaveId,
            @RequestParam UUID approverId,
            @RequestBody(required = false) LeaveActionRequest request) {
        return ResponseEntity.ok(leaveService.approveLeave(leaveId, approverId, request));
    }

    @PatchMapping("/{leaveId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Reject leave", description = "Reject a pending leave request (Manager/Admin)")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> rejectLeave(
            @PathVariable UUID leaveId,
            @RequestParam UUID approverId,
            @RequestBody(required = false) LeaveActionRequest request) {
        return ResponseEntity.ok(leaveService.rejectLeave(leaveId, approverId, request));
    }

    @PatchMapping("/{leaveId}/cancel")
    @Operation(summary = "Cancel leave", description = "Cancel your own leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancelLeave(
            @PathVariable UUID leaveId,
            @RequestParam UUID employeeId) {
        return ResponseEntity.ok(leaveService.cancelLeave(leaveId, employeeId));
    }

    @GetMapping("/{leaveId}")
    @Operation(summary = "Get leave request by ID")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> getById(@PathVariable UUID leaveId) {
        return ResponseEntity.ok(leaveService.getById(leaveId));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get employee leaves", description = "Get all leave requests for an employee")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> getByEmployee(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(leaveService.getByEmployee(employeeId, page, size));
    }

    @GetMapping("/pending/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Pending approvals", description = "Get pending leave requests for manager's team")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> getPendingForManager(
            @PathVariable UUID managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(leaveService.getPendingForManager(managerId, page, size));
    }

    @GetMapping("/team/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Team leaves", description = "Get all leave requests for manager's team")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> getAllForManager(
            @PathVariable UUID managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(leaveService.getAllForManager(managerId, page, size));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get leaves by status", description = "Filter leaves by status (Admin only)")
    public ResponseEntity<PagedResponse<LeaveRequestResponse>> getByStatus(
            @PathVariable LeaveStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(leaveService.getByStatus(status, page, size));
    }

    @GetMapping("/balances/{employeeId}")
    @Operation(summary = "Get leave balances", description = "Get leave balances for an employee for a specific year")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> getLeaveBalances(
            @PathVariable UUID employeeId,
            @RequestParam int year) {
        return ResponseEntity.ok(leaveService.getLeaveBalances(employeeId, year));
    }

    @PostMapping("/grant-compoff/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Grant comp-off", description = "Grant compensatory off to an employee")
    public ResponseEntity<ApiResponse<LeaveBalanceResponse>> grantCompOff(
            @PathVariable UUID employeeId,
            @RequestParam int days) {
        return ResponseEntity.ok(leaveService.grantCompOff(employeeId, days));
    }

    @PostMapping("/carry-forward/{year}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Carry forward leaves", description = "Carry forward earned leaves to next year")
    public ResponseEntity<ApiResponse<Void>> carryForwardLeaves(
            @PathVariable int year) {
        return ResponseEntity.ok(leaveService.carryForwardLeaves(year));
    }
}
