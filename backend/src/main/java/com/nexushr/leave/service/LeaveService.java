package com.nexushr.leave.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.leave.dto.*;
import com.nexushr.leave.model.LeaveStatus;

import java.util.List;
import java.util.UUID;

public interface LeaveService {

    ApiResponse<LeaveRequestResponse> applyLeave(UUID employeeId, LeaveApplyRequest request);

    ApiResponse<LeaveRequestResponse> approveLeave(UUID leaveId, UUID approverId, LeaveActionRequest request);

    ApiResponse<LeaveRequestResponse> rejectLeave(UUID leaveId, UUID approverId, LeaveActionRequest request);

    ApiResponse<LeaveRequestResponse> cancelLeave(UUID leaveId, UUID employeeId);

    ApiResponse<LeaveRequestResponse> getById(UUID leaveId);

    PagedResponse<LeaveRequestResponse> getByEmployee(UUID employeeId, int page, int size);

    PagedResponse<LeaveRequestResponse> getPendingForManager(UUID managerId, int page, int size);

    PagedResponse<LeaveRequestResponse> getByStatus(LeaveStatus status, int page, int size);

    PagedResponse<LeaveRequestResponse> getAllForManager(UUID managerId, int page, int size);

    ApiResponse<List<LeaveBalanceResponse>> getLeaveBalances(UUID employeeId, int year);
}
