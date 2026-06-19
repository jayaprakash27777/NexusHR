package com.nexushr.attendance.service;

import com.nexushr.attendance.dto.AttendanceResponse;
import com.nexushr.attendance.dto.AttendanceSummaryResponse;
import com.nexushr.attendance.dto.CheckInRequest;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AttendanceService {

    ApiResponse<AttendanceResponse> checkIn(UUID employeeId, CheckInRequest request);

    ApiResponse<AttendanceResponse> checkOut(UUID employeeId);

    ApiResponse<AttendanceResponse> getTodayAttendance(UUID employeeId);

    PagedResponse<AttendanceResponse> getAttendanceHistory(UUID employeeId, int page, int size);

    ApiResponse<List<AttendanceResponse>> getMonthlyAttendance(UUID employeeId, int year, int month);

    ApiResponse<AttendanceSummaryResponse> getMonthlySummary(UUID employeeId, int year, int month);

    ApiResponse<List<AttendanceResponse>> getDailyReport(LocalDate date);
}
