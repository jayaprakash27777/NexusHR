package com.nexushr.payroll.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.payroll.dto.PayrollProcessRequest;
import com.nexushr.payroll.dto.PayrollResponse;
import com.nexushr.payroll.dto.PayrollSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface PayrollService {

    ApiResponse<PayrollResponse> processPayroll(PayrollProcessRequest request);

    ApiResponse<List<PayrollResponse>> batchProcessPayroll(int month, int year);

    ApiResponse<PayrollResponse> markAsPaid(UUID payrollId);

    ApiResponse<PayrollResponse> reversePayroll(UUID payrollId);

    ApiResponse<PayrollResponse> getById(UUID payrollId);

    ApiResponse<PayrollResponse> getByEmployeeAndMonth(UUID employeeId, int month, int year);

    PagedResponse<PayrollResponse> getEmployeePayrollHistory(UUID employeeId, int page, int size);

    ApiResponse<List<PayrollResponse>> getMonthlyPayroll(int month, int year);

    PagedResponse<PayrollResponse> searchMonthlyPayroll(int month, int year, String search, String department, int page, int size, String sort, String dir);

    ApiResponse<PayrollSummaryResponse> getMonthlyPayrollSummary(int month, int year);
    
    ApiResponse<com.nexushr.payroll.dto.PayrollAnalyticsResponse> getAnalytics(int month, int year);
    
    // Batch Lifecycle Actions
    ApiResponse<String> approveMonthlyPayroll(int month, int year);
    ApiResponse<String> lockMonthlyPayroll(int month, int year);
    ApiResponse<String> unlockMonthlyPayroll(int month, int year);

    // Audit Logs
    ApiResponse<List<com.nexushr.payroll.dto.PayrollAuditLogResponse>> getAuditLogs(int month, int year);
}
