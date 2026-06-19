package com.nexushr.dashboard.service;

import com.nexushr.attendance.model.AttendanceStatus;
import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AnalyticsResponse;
import com.nexushr.dashboard.dto.AnalyticsResponse.DailyAttendance;
import com.nexushr.dashboard.dto.AnalyticsResponse.MonthlyHeadcount;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.model.LeaveStatus;
import com.nexushr.leave.repository.LeaveRequestRepository;
import com.nexushr.payroll.repository.PayrollRepository;
import com.nexushr.performance.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRepository payrollRepository;
    private final PerformanceReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AnalyticsResponse> getComprehensiveAnalytics() {
        List<Employee> allEmployees = employeeRepository.findAll();
        List<Employee> activeEmployees = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.toList());
        LocalDate today = LocalDate.now();

        // Headcount
        long total = allEmployees.size();
        long active = activeEmployees.size();
        long terminated = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.TERMINATED).count();
        double attritionRate = total > 0 ? (double) terminated / total * 100 : 0;

        Map<String, Long> byDept = activeEmployees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getName(), Collectors.counting()));

        Map<String, Long> byDesignation = activeEmployees.stream()
                .filter(e -> e.getDesignation() != null)
                .collect(Collectors.groupingBy(Employee::getDesignation, Collectors.counting()));

        // Headcount trend (last 6 months - simulated with current count)
        List<MonthlyHeadcount> headcountTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            headcountTrend.add(MonthlyHeadcount.builder()
                    .month(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .count(active - i) // Simple simulation
                    .build());
        }

        // Salary analytics
        List<BigDecimal> salaries = activeEmployees.stream()
                .map(Employee::getSalary)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());

        BigDecimal avgSalary = BigDecimal.ZERO;
        BigDecimal medianSalary = BigDecimal.ZERO;
        BigDecimal minSalary = BigDecimal.ZERO;
        BigDecimal maxSalary = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        if (!salaries.isEmpty()) {
            totalCost = salaries.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            avgSalary = totalCost.divide(BigDecimal.valueOf(salaries.size()), 2, RoundingMode.HALF_UP);
            minSalary = salaries.get(0);
            maxSalary = salaries.get(salaries.size() - 1);
            medianSalary = salaries.get(salaries.size() / 2);
        }

        Map<String, BigDecimal> avgSalaryByDept = activeEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getSalary() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment().getName(),
                        Collectors.collectingAndThen(Collectors.toList(),
                                list -> list.stream().map(Employee::getSalary)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .divide(BigDecimal.valueOf(list.size()), 2, RoundingMode.HALF_UP))));

        Map<String, BigDecimal> avgSalaryByDesig = activeEmployees.stream()
                .filter(e -> e.getDesignation() != null && e.getSalary() != null)
                .collect(Collectors.groupingBy(
                        Employee::getDesignation,
                        Collectors.collectingAndThen(Collectors.toList(),
                                list -> list.stream().map(Employee::getSalary)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .divide(BigDecimal.valueOf(list.size()), 2, RoundingMode.HALF_UP))));

        // Attendance daily trend (last 7 days)
        List<DailyAttendance> dailyTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            if (date.getDayOfWeek().getValue() <= 5) {
                long present = attendanceRepository.countByDateAndStatus(date, AttendanceStatus.PRESENT);
                long tracked = attendanceRepository.countDistinctEmployeesByDate(date);
                double rate = active > 0 ? (double) present / active * 100 : 0;
                dailyTrend.add(DailyAttendance.builder()
                        .date(date.toString())
                        .present(present)
                        .absent(Math.max(0, active - present))
                        .rate(Math.round(rate * 100.0) / 100.0)
                        .build());
            }
        }

        double overallAttendance = dailyTrend.isEmpty() ? 0
                : dailyTrend.stream().mapToDouble(DailyAttendance::getRate).average().orElse(0);

        // Leave analytics
        Map<String, Long> leavesByStatus = new LinkedHashMap<>();
        for (LeaveStatus s : LeaveStatus.values()) {
            long count = leaveRequestRepository.findByStatusOrderByAppliedAtDesc(s,
                    org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
            leavesByStatus.put(s.name(), count);
        }

        // Performance
        Double avgRating = reviewRepository.getOverallAverageRating();

        // Rating distribution
        Map<String, Long> ratingDist = new LinkedHashMap<>();
        ratingDist.put("1-2 (Needs Improvement)", 0L);
        ratingDist.put("2-3 (Meets Some)", 0L);
        ratingDist.put("3-4 (Meets Expectations)", 0L);
        ratingDist.put("4-5 (Exceeds)", 0L);

        AnalyticsResponse analytics = AnalyticsResponse.builder()
                .totalHeadcount(total)
                .activeHeadcount(active)
                .attritionRate(Math.round(attritionRate * 100.0) / 100.0)
                .headcountByDepartment(byDept)
                .headcountByDesignation(byDesignation)
                .headcountTrend(headcountTrend)
                .averageSalary(avgSalary)
                .medianSalary(medianSalary)
                .minSalary(minSalary)
                .maxSalary(maxSalary)
                .totalMonthlyCost(totalCost)
                .avgSalaryByDepartment(avgSalaryByDept)
                .avgSalaryByDesignation(avgSalaryByDesig)
                .overallAttendanceRate(Math.round(overallAttendance * 100.0) / 100.0)
                .attendanceByDepartment(Map.of())
                .dailyAttendanceTrend(dailyTrend)
                .leavesByType(Map.of())
                .leavesByStatus(leavesByStatus)
                .avgLeavesPerEmployee(0)
                .avgPerformanceRating(avgRating != null ? avgRating : 0)
                .performanceByDepartment(Map.of())
                .ratingDistribution(ratingDist)
                .build();

        return ApiResponse.success(analytics);
    }
}
