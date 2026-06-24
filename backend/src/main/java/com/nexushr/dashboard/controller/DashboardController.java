package com.nexushr.dashboard.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AdminDashboardResponse;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse;
import com.nexushr.dashboard.dto.HRDashboardResponse;
import com.nexushr.dashboard.dto.FinanceDashboardResponse;
import com.nexushr.dashboard.dto.ExecutiveDashboardResponse;
import com.nexushr.dashboard.dto.AuditorDashboardResponse;
import com.nexushr.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-based dashboard endpoints")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ExecutorService sseExecutor = Executors.newCachedThreadPool();

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Admin dashboard", description = "Comprehensive org-wide dashboard with all metrics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEAD')")
    @Operation(summary = "Manager dashboard", description = "Team-focused dashboard with approvals and member status")
    public ResponseEntity<ApiResponse<ManagerDashboardResponse>> getManagerDashboard(
            @PathVariable UUID managerId) {
        return ResponseEntity.ok(dashboardService.getManagerDashboard(managerId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeSecurity.isSelf(#employeeId, authentication)")
    @Operation(summary = "Employee dashboard", description = "Personal dashboard with attendance, leaves, payroll, performance")
    public ResponseEntity<ApiResponse<EmployeeDashboardResponse>> getEmployeeDashboard(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(employeeId));
    }

    @GetMapping("/employee/{employeeId}/stream")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER') or @employeeSecurity.isSelf(#employeeId, authentication)")
    @Operation(summary = "Employee dashboard SSE stream", description = "Real-time updates for dashboard")
    public SseEmitter streamEmployeeDashboard(@PathVariable UUID employeeId) {
        SseEmitter emitter = new SseEmitter(300000L); // 5 min timeout
        sseExecutor.execute(() -> {
            try {
                for (int i = 0; i < 60; i++) { // 60 * 5s = 5 mins
                    EmployeeDashboardResponse data = dashboardService.getEmployeeDashboard(employeeId).getData();
                    emitter.send(SseEmitter.event().name("dashboard").data(data));
                    Thread.sleep(5000);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    @GetMapping("/hr")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'HR_DIRECTOR', 'HR_EXECUTIVE')")
    @Operation(summary = "HR dashboard", description = "Global HR metrics and recruitment pipeline")
    public ResponseEntity<ApiResponse<HRDashboardResponse>> getHRDashboard() {
        return ResponseEntity.ok(dashboardService.getHRDashboard());
    }

    @GetMapping("/finance")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FINANCE_MANAGER')")
    @Operation(summary = "Finance dashboard", description = "Global payroll distribution and budget forecasting")
    public ResponseEntity<ApiResponse<FinanceDashboardResponse>> getFinanceDashboard() {
        return ResponseEntity.ok(dashboardService.getFinanceDashboard());
    }

    @GetMapping("/executive")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Executive dashboard", description = "High-level KPIs for C-level executives")
    public ResponseEntity<ApiResponse<ExecutiveDashboardResponse>> getExecutiveDashboard() {
        return ResponseEntity.ok(dashboardService.getExecutiveDashboard());
    }

    @GetMapping("/auditor")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'AUDITOR')")
    @Operation(summary = "Auditor dashboard", description = "Security monitoring, compliance tracking, and audit trail")
    public ResponseEntity<ApiResponse<AuditorDashboardResponse>> getAuditorDashboard() {
        return ResponseEntity.ok(dashboardService.getAuditorDashboard());
    }
}
