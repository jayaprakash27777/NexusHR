package com.nexushr.dashboard.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AdminDashboardResponse;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse;
import com.nexushr.dashboard.dto.HRDashboardResponse;
import com.nexushr.dashboard.dto.FinanceDashboardResponse;
import com.nexushr.dashboard.dto.ExecutiveDashboardResponse;
import com.nexushr.dashboard.dto.AuditorDashboardResponse;

import java.util.UUID;

public interface DashboardService {

    ApiResponse<AdminDashboardResponse> getAdminDashboard();

    ApiResponse<ManagerDashboardResponse> getManagerDashboard(UUID managerId);

    ApiResponse<EmployeeDashboardResponse> getEmployeeDashboard(UUID employeeId);

    ApiResponse<HRDashboardResponse> getHRDashboard();

    ApiResponse<FinanceDashboardResponse> getFinanceDashboard();

    ApiResponse<ExecutiveDashboardResponse> getExecutiveDashboard();

    ApiResponse<AuditorDashboardResponse> getAuditorDashboard();
}
