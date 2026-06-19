package com.nexushr.dashboard.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AdminDashboardResponse;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse;
import com.nexushr.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-based dashboard endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin dashboard", description = "Comprehensive org-wide dashboard with all metrics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Manager dashboard", description = "Team-focused dashboard with approvals and member status")
    public ResponseEntity<ApiResponse<ManagerDashboardResponse>> getManagerDashboard(
            @PathVariable UUID managerId) {
        return ResponseEntity.ok(dashboardService.getManagerDashboard(managerId));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Employee dashboard", description = "Personal dashboard with attendance, leaves, payroll, performance")
    public ResponseEntity<ApiResponse<EmployeeDashboardResponse>> getEmployeeDashboard(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(employeeId));
    }
}
