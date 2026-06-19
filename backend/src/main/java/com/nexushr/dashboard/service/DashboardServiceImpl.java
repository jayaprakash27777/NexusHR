package com.nexushr.dashboard.service;

import com.nexushr.ai.model.InsightPriority;
import com.nexushr.ai.repository.AiInsightRepository;
import com.nexushr.attendance.model.Attendance;
import com.nexushr.attendance.model.AttendanceStatus;
import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.dashboard.dto.AdminDashboardResponse;
import com.nexushr.dashboard.dto.AdminDashboardResponse.MonthlyTrend;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse.LeaveBalanceSummary;
import com.nexushr.dashboard.dto.ManagerDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse.TeamMemberSummary;
import com.nexushr.department.repository.DepartmentRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.model.LeaveStatus;
import com.nexushr.leave.repository.LeaveBalanceRepository;
import com.nexushr.leave.repository.LeaveRequestRepository;
import com.nexushr.notification.repository.NotificationRepository;
import com.nexushr.payroll.model.PayrollStatus;
import com.nexushr.payroll.repository.PayrollRepository;
import com.nexushr.performance.model.GoalStatus;
import com.nexushr.performance.model.ReviewStatus;
import com.nexushr.performance.repository.PerformanceGoalRepository;
import com.nexushr.performance.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PayrollRepository payrollRepository;
    private final PerformanceReviewRepository reviewRepository;
    private final PerformanceGoalRepository goalRepository;
    private final AiInsightRepository insightRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "'admin'")
    public ApiResponse<AdminDashboardResponse> getAdminDashboard() {
        List<Employee> allEmployees = employeeRepository.findAll();
        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();
        int currentMonth = today.getMonthValue();

        long total = allEmployees.size();
        long active = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.ACTIVE).count();
        long onNotice = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.ON_NOTICE).count();

        // New hires this month
        YearMonth currentYm = YearMonth.now();
        long newHires = allEmployees.stream()
                .filter(e -> e.getJoiningDate() != null)
                .filter(e -> YearMonth.from(e.getJoiningDate()).equals(currentYm))
                .count();

        long totalDepts = departmentRepository.findByActiveTrue().size();

        // Attendance today
        long presentToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long totalTracked = attendanceRepository.countDistinctEmployeesByDate(today);
        double attendanceRate = active > 0 ? (double) presentToday / active * 100 : 0;

        // Leave
        long pendingLeaves = leaveRequestRepository.countAllPending();

        // Payroll
        BigDecimal monthlyPayroll = payrollRepository.totalPayrollForMonth(currentMonth, currentYear);
        long payrollDraft = payrollRepository.countByMonthYearAndStatus(currentMonth, currentYear, PayrollStatus.DRAFT);
        long payrollPaid = payrollRepository.countByMonthYearAndStatus(currentMonth, currentYear, PayrollStatus.PAID);

        // Performance
        long pendingReviews = reviewRepository.countByStatusAndYear(ReviewStatus.PENDING, currentYear);
        Double avgRating = reviewRepository.getOverallAverageRating();

        // AI Insights
        long activeInsights = insightRepository.countByDismissedFalse();
        long criticalInsights = insightRepository.countByPriorityAndDismissedFalse(InsightPriority.CRITICAL)
                + insightRepository.countByPriorityAndDismissedFalse(InsightPriority.HIGH);

        // By department
        Map<String, Long> byDept = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getName(), Collectors.counting()));

        Map<String, Long> byStatus = allEmployees.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting()));

        // Monthly trends (last 6 months simulated)
        List<MonthlyTrend> attendanceTrend = new ArrayList<>();
        List<MonthlyTrend> payrollTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            attendanceTrend.add(MonthlyTrend.builder().month(monthName).value(85 + Math.random() * 10).build());
            BigDecimal mp = payrollRepository.totalPayrollForMonth(ym.getMonthValue(), ym.getYear());
            payrollTrend.add(MonthlyTrend.builder().month(monthName).value(mp.doubleValue()).build());
        }

        AdminDashboardResponse dashboard = AdminDashboardResponse.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .onNoticeEmployees(onNotice)
                .newHiresThisMonth(newHires)
                .totalDepartments(totalDepts)
                .presentToday(presentToday)
                .absentToday(Math.max(0, active - presentToday))
                .attendanceRateToday(Math.round(attendanceRate * 100.0) / 100.0)
                .pendingLeaveRequests(pendingLeaves)
                .approvedLeavesToday(0)
                .currentMonthPayroll(monthlyPayroll)
                .payrollsPending(payrollDraft)
                .payrollsPaid(payrollPaid)
                .pendingReviews(pendingReviews)
                .averagePerformanceRating(avgRating != null ? avgRating : 0.0)
                .activeInsights(activeInsights)
                .criticalInsights(criticalInsights)
                .unreadNotifications(0)
                .employeesByDepartment(byDept)
                .employeesByStatus(byStatus)
                .attendanceTrend(attendanceTrend)
                .payrollTrend(payrollTrend)
                .build();

        return ApiResponse.success(dashboard);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ManagerDashboardResponse> getManagerDashboard(UUID managerId) {
        Employee manager = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", managerId));

        LocalDate today = LocalDate.now();

        // Team members (direct reports)
        List<Employee> teamMembers = employeeRepository.findAll().stream()
                .filter(e -> e.getManager() != null && e.getManager().getId().equals(managerId))
                .collect(Collectors.toList());

        long teamSize = teamMembers.size();
        long activeTeam = teamMembers.stream().filter(e -> e.getStatus() == EmployeeStatus.ACTIVE).count();

        // Team attendance today
        long teamPresent = 0;
        List<TeamMemberSummary> memberSummaries = new ArrayList<>();
        for (Employee member : teamMembers) {
            boolean present = attendanceRepository.findByEmployeeIdAndDate(member.getId(), today)
                    .map(a -> a.getCheckInTime() != null).orElse(false);
            if (present) teamPresent++;

            memberSummaries.add(TeamMemberSummary.builder()
                    .employeeId(member.getEmployeeId())
                    .name(member.getFullName())
                    .designation(member.getDesignation())
                    .status(member.getStatus().name())
                    .presentToday(present)
                    .build());
        }

        double teamAttendanceRate = activeTeam > 0 ? (double) teamPresent / activeTeam * 100 : 0;

        // Leave approvals
        long pendingLeaves = leaveRequestRepository.countPendingByManager(managerId);

        // Performance
        List<com.nexushr.performance.model.PerformanceReview> pendingReviews =
                reviewRepository.findPendingReviewsByReviewer(managerId);

        // Goals
        long goalsInProgress = 0;
        long goalsCompleted = 0;
        for (Employee member : teamMembers) {
            goalsInProgress += goalRepository.countByEmployeeIdAndStatus(member.getId(), GoalStatus.IN_PROGRESS);
            goalsCompleted += goalRepository.countByEmployeeIdAndStatus(member.getId(), GoalStatus.COMPLETED);
        }

        ManagerDashboardResponse dashboard = ManagerDashboardResponse.builder()
                .teamSize(teamSize)
                .activeTeamMembers(activeTeam)
                .departmentName(manager.getDepartment() != null ? manager.getDepartment().getName() : "N/A")
                .teamPresentToday(teamPresent)
                .teamAbsentToday(Math.max(0, activeTeam - teamPresent))
                .teamAttendanceRate(Math.round(teamAttendanceRate * 100.0) / 100.0)
                .pendingLeaveApprovals(pendingLeaves)
                .approvedLeavesThisMonth(0)
                .pendingPerformanceReviews(pendingReviews.size())
                .teamAvgPerformanceRating(0.0)
                .goalsInProgress(goalsInProgress)
                .goalsCompleted(goalsCompleted)
                .teamMembers(memberSummaries)
                .build();

        return ApiResponse.success(dashboard);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EmployeeDashboardResponse> getEmployeeDashboard(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();
        int currentMonth = today.getMonthValue();

        // Today's attendance
        Optional<Attendance> todayAttendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        String attendanceStatus = "NOT_CHECKED_IN";
        java.time.LocalDateTime checkIn = null;
        java.time.LocalDateTime checkOut = null;
        BigDecimal workHours = BigDecimal.ZERO;

        if (todayAttendance.isPresent()) {
            Attendance a = todayAttendance.get();
            attendanceStatus = a.getCheckOutTime() != null ? "CHECKED_OUT" : "CHECKED_IN";
            checkIn = a.getCheckInTime();
            checkOut = a.getCheckOutTime();
            workHours = a.getWorkHours();
        }

        // Monthly attendance
        YearMonth ym = YearMonth.now();
        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();
        long presentDays = attendanceRepository.countByEmployeeAndDateRangeAndStatus(
                employeeId, monthStart, monthEnd, AttendanceStatus.PRESENT);
        long workingDays = 0;
        for (LocalDate d = monthStart; !d.isAfter(today) && !d.isAfter(monthEnd); d = d.plusDays(1)) {
            if (d.getDayOfWeek().getValue() <= 5) workingDays++;
        }
        double attendancePct = workingDays > 0 ? (double) presentDays / workingDays * 100 : 0;

        // Leave balances
        List<LeaveBalanceSummary> leaveBalances = leaveBalanceRepository
                .findByEmployeeIdAndYear(employeeId, currentYear)
                .stream()
                .map(b -> LeaveBalanceSummary.builder()
                        .leaveType(b.getLeaveType().name())
                        .total(b.getTotalDays())
                        .used(b.getUsedDays())
                        .remaining(b.getRemainingDays())
                        .build())
                .collect(Collectors.toList());

        long pendingLeaves = leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, LeaveStatus.PENDING).size();

        // Payroll - last month
        int lastMonth = currentMonth == 1 ? 12 : currentMonth - 1;
        int lastMonthYear = currentMonth == 1 ? currentYear - 1 : currentYear;
        BigDecimal lastSalary = payrollRepository.findByEmployeeIdAndMonthAndYear(employeeId, lastMonth, lastMonthYear)
                .map(p -> p.getNetSalary()).orElse(BigDecimal.ZERO);
        String lastPayrollLabel = Month.of(lastMonth).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + lastMonthYear;

        // Performance
        Double avgRating = reviewRepository.getAverageRating(employeeId);
        long activeGoals = goalRepository.countByEmployeeIdAndStatus(employeeId, GoalStatus.IN_PROGRESS)
                + goalRepository.countByEmployeeIdAndStatus(employeeId, GoalStatus.NOT_STARTED);
        long completedGoals = goalRepository.countByEmployeeIdAndStatus(employeeId, GoalStatus.COMPLETED);

        // Notifications
        // We need the user ID from auth module; for now use employee's associated user
        long unreadNotifs = 0;

        EmployeeDashboardResponse dashboard = EmployeeDashboardResponse.builder()
                .employeeId(employee.getEmployeeId())
                .name(employee.getFullName())
                .department(employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A")
                .designation(employee.getDesignation())
                .attendanceStatus(attendanceStatus)
                .checkInTime(checkIn)
                .checkOutTime(checkOut)
                .workHoursToday(workHours)
                .presentDaysThisMonth(presentDays)
                .totalWorkingDaysThisMonth(workingDays)
                .attendancePercentage(Math.round(attendancePct * 100.0) / 100.0)
                .leaveBalances(leaveBalances)
                .pendingLeaveRequests(pendingLeaves)
                .lastMonthNetSalary(lastSalary)
                .lastPayrollMonth(lastPayrollLabel)
                .latestPerformanceRating(avgRating != null ? BigDecimal.valueOf(avgRating) : null)
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .unreadNotifications(unreadNotifs)
                .build();

        return ApiResponse.success(dashboard);
    }
}
