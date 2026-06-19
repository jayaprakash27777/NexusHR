package com.nexushr.attendance.service;

import com.nexushr.attendance.dto.AttendanceResponse;
import com.nexushr.attendance.dto.AttendanceSummaryResponse;
import com.nexushr.attendance.dto.CheckInRequest;
import com.nexushr.attendance.model.Attendance;
import com.nexushr.attendance.model.AttendanceStatus;
import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public ApiResponse<AttendanceResponse> checkIn(UUID employeeId, CheckInRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate today = LocalDate.now();

        if (attendanceRepository.existsByEmployeeIdAndDate(employeeId, today)) {
            Attendance existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                    .orElseThrow(() -> new BadRequestException("Attendance record issue"));
            if (existing.getCheckInTime() != null) {
                throw new BadRequestException("Already checked in today at " + existing.getCheckInTime().toLocalTime());
            }
        }

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElse(Attendance.builder()
                        .employee(employee)
                        .date(today)
                        .status(AttendanceStatus.PRESENT)
                        .build());

        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setStatus(AttendanceStatus.PRESENT);
        if (request != null && request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Check-in recorded for {} at {}", employee.getEmployeeId(), saved.getCheckInTime());

        return ApiResponse.success("Checked in successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<AttendanceResponse> checkOut(UUID employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BadRequestException("No check-in found for today. Please check in first."));

        if (attendance.getCheckInTime() == null) {
            throw new BadRequestException("No check-in found for today. Please check in first.");
        }
        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("Already checked out today at " + attendance.getCheckOutTime().toLocalTime());
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        attendance.setCheckOutTime(checkOutTime);

        // Calculate work hours
        Duration duration = Duration.between(attendance.getCheckInTime(), checkOutTime);
        BigDecimal hours = BigDecimal.valueOf(duration.toMinutes())
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        attendance.setWorkHours(hours);

        // Determine if half day (less than 4 hours)
        if (hours.compareTo(BigDecimal.valueOf(4)) < 0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Check-out recorded for employee {} - {} hours", employeeId, hours);

        return ApiResponse.success("Checked out successfully. Work hours: " + hours, mapToResponse(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AttendanceResponse> getTodayAttendance(UUID employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(a -> ApiResponse.success(mapToResponse(a)))
                .orElse(ApiResponse.success("No attendance record for today", null));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getAttendanceHistory(UUID employeeId, int page, int size) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        Page<Attendance> attendancePage = attendanceRepository.findByEmployeeIdOrderByDateDesc(
                employeeId, PageRequest.of(page, size));

        List<AttendanceResponse> content = attendancePage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return PagedResponse.<AttendanceResponse>builder()
                .content(content)
                .page(attendancePage.getNumber())
                .size(attendancePage.getSize())
                .totalElements(attendancePage.getTotalElements())
                .totalPages(attendancePage.getTotalPages())
                .last(attendancePage.isLast())
                .first(attendancePage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AttendanceResponse>> getMonthlyAttendance(UUID employeeId, int year, int month) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<AttendanceResponse> records = attendanceRepository
                .findByEmployeeIdAndDateBetweenOrderByDateDesc(employeeId, start, end)
                .stream().map(this::mapToResponse).collect(Collectors.toList());

        return ApiResponse.success(records);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AttendanceSummaryResponse> getMonthlySummary(UUID employeeId, int year, int month) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        long totalRecords = attendanceRepository.countByEmployeeAndDateRange(employeeId, start, end);
        long present = attendanceRepository.countByEmployeeAndDateRangeAndStatus(employeeId, start, end, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByEmployeeAndDateRangeAndStatus(employeeId, start, end, AttendanceStatus.ABSENT);
        long halfDay = attendanceRepository.countByEmployeeAndDateRangeAndStatus(employeeId, start, end, AttendanceStatus.HALF_DAY);
        long leave = attendanceRepository.countByEmployeeAndDateRangeAndStatus(employeeId, start, end, AttendanceStatus.LEAVE);
        double avgHours = attendanceRepository.avgWorkHoursByEmployeeAndDateRange(employeeId, start, end);

        // Calculate working days (exclude weekends)
        long workingDays = 0;
        for (LocalDate d = start; !d.isAfter(end) && !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
            if (d.getDayOfWeek().getValue() <= 5) workingDays++;
        }

        double percentage = workingDays > 0 ? (double) (present + halfDay) / workingDays * 100 : 0;

        AttendanceSummaryResponse summary = AttendanceSummaryResponse.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFullName())
                .year(year)
                .month(month)
                .totalWorkingDays(workingDays)
                .presentDays(present)
                .absentDays(absent)
                .halfDays(halfDay)
                .leaveDays(leave)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .averageWorkHours(Math.round(avgHours * 100.0) / 100.0)
                .build();

        return ApiResponse.success(summary);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AttendanceResponse>> getDailyReport(LocalDate date) {
        List<AttendanceResponse> records = attendanceRepository.findByDateOrderByEmployeeFirstNameAsc(date)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success(records);
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployee().getId())
                .employeeName(attendance.getEmployee().getFullName())
                .employeeCode(attendance.getEmployee().getEmployeeId())
                .date(attendance.getDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus())
                .workHours(attendance.getWorkHours())
                .notes(attendance.getNotes())
                .createdAt(attendance.getCreatedAt())
                .build();
    }
}
