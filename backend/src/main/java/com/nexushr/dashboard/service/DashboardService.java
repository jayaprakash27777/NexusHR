package com.nexushr.dashboard.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AdminDashboardResponse;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse;

import java.util.UUID;

public interface DashboardService {

    ApiResponse<AdminDashboardResponse> getAdminDashboard();

    ApiResponse<ManagerDashboardResponse> getManagerDashboard(UUID managerId);

    ApiResponse<EmployeeDashboardResponse> getEmployeeDashboard(UUID employeeId);
}
