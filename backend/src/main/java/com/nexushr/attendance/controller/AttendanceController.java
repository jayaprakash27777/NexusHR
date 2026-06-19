package com.nexushr.attendance.controller;

import com.nexushr.attendance.dto.AttendanceResponse;
import com.nexushr.attendance.dto.AttendanceSummaryResponse;
import com.nexushr.attendance.dto.CheckInRequest;
import com.nexushr.attendance.service.AttendanceService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance management endpoints")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in/{employeeId}")
    @Operation(summary = "Check in", description = "Records employee check-in for today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(
            @PathVariable UUID employeeId,
            @RequestBody(required = false) CheckInRequest request) {
        return ResponseEntity.ok(attendanceService.checkIn(employeeId, request));
    }

    @PostMapping("/check-out/{employeeId}")
    @Operation(summary = "Check out", description = "Records employee check-out and calculates work hours")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(attendanceService.checkOut(employeeId));
    }

    @GetMapping("/today/{employeeId}")
    @Operation(summary = "Get today's attendance", description = "Get current day's attendance record")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayAttendance(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(employeeId));
    }

    @GetMapping("/history/{employeeId}")
    @Operation(summary = "Attendance history", description = "Get paginated attendance history for an employee")
    public ResponseEntity<PagedResponse<AttendanceResponse>> getHistory(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(attendanceService.getAttendanceHistory(employeeId, page, size));
    }

    @GetMapping("/monthly/{employeeId}")
    @Operation(summary = "Monthly attendance", description = "Get all attendance records for a specific month")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMonthlyAttendance(
            @PathVariable UUID employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance(employeeId, year, month));
    }

    @GetMapping("/summary/{employeeId}")
    @Operation(summary = "Monthly summary", description = "Get attendance summary with percentages for a month")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> getMonthlySummary(
            @PathVariable UUID employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getMonthlySummary(employeeId, year, month));
    }

    @GetMapping("/daily-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Daily report", description = "Get attendance for all employees on a specific date (Admin/Manager)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getDailyReport(date));
    }
}
