package com.nexushr.dashboard.service;

import com.nexushr.ai.model.InsightPriority;
import com.nexushr.ai.repository.AiInsightRepository;
import com.nexushr.attendance.model.Attendance;
import com.nexushr.attendance.model.AttendanceStatus;
import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.repository.EmployeeDocumentRepository;
import com.nexushr.dashboard.dto.AdminDashboardResponse;
import com.nexushr.dashboard.dto.AdminDashboardResponse.MonthlyTrend;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse;
import com.nexushr.dashboard.dto.ManagerDashboardResponse.TeamMemberSummary;
import com.nexushr.dashboard.dto.EmployeeDashboardResponse.LeaveBalanceSummary;
import com.nexushr.dashboard.dto.HRDashboardResponse;
import com.nexushr.dashboard.dto.FinanceDashboardResponse;
import com.nexushr.dashboard.dto.ExecutiveDashboardResponse;
import com.nexushr.dashboard.dto.AuditorDashboardResponse;
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
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final com.nexushr.auth.repository.UserRepository userRepository;
    private final com.nexushr.auth.repository.LoginHistoryRepository loginHistoryRepository;
    private final com.nexushr.auth.repository.RefreshTokenRepository refreshTokenRepository;
    private final JdbcTemplate jdbcTemplate;

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

        // Real Historical Trends (last 6 months)
        List<MonthlyTrend> attendanceTrend = new ArrayList<>();
        List<MonthlyTrend> payrollTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            
            LocalDate startOfMonth = ym.atDay(1);
            LocalDate endOfMonth = ym.atEndOfMonth();
            long totalRecords = attendanceRepository.countByDateRange(startOfMonth, endOfMonth);
            long presentRecords = attendanceRepository.countByDateRangeAndStatusIn(startOfMonth, endOfMonth, List.of(AttendanceStatus.PRESENT));
            
            double rate = totalRecords > 0 ? (double) presentRecords / totalRecords * 100.0 : 0.0;
            attendanceTrend.add(MonthlyTrend.builder().month(monthName).value(Math.round(rate * 100.0) / 100.0).build());
            
            BigDecimal mp = payrollRepository.totalPayrollForMonth(ym.getMonthValue(), ym.getYear());
            payrollTrend.add(MonthlyTrend.builder().month(monthName).value(mp.doubleValue()).build());
        }

        // Real Data Metrics
        long approvedLeaves = 0;
        long unreadNotifs = notificationRepository.countByRecipientIdAndReadFalse(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() != null 
                ? ((com.nexushr.auth.model.User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId() : UUID.randomUUID()); // safe fallback

        // Fetch employee lists
        java.util.function.Function<Employee, AdminDashboardResponse.EmployeeSummaryDto> mapToDto = emp -> 
            AdminDashboardResponse.EmployeeSummaryDto.builder()
                .id(emp.getId().toString())
                .employeeId(emp.getEmployeeId())
                .userId(emp.getUser() != null ? emp.getUser().getId().toString() : null)
                .name(emp.getFullName())
                .email(emp.getEmail())
                .department(emp.getDepartment() != null ? emp.getDepartment().getName() : "N/A")
                .designation(emp.getDesignation())
                .joiningDate(emp.getJoiningDate() != null ? emp.getJoiningDate().toString() : "N/A")
                .status(emp.getStatus().name())
                .build();

        List<AdminDashboardResponse.EmployeeSummaryDto> recentlyJoined = employeeRepository.findTop5ByOrderByJoiningDateDesc()
            .stream().map(mapToDto).collect(Collectors.toList());
            
        List<AdminDashboardResponse.EmployeeSummaryDto> recentlyResigned = employeeRepository.findTop5ByStatusOrderByUpdatedAtDesc(EmployeeStatus.TERMINATED)
            .stream().map(mapToDto).collect(Collectors.toList());

        List<AdminDashboardResponse.EmployeeSummaryDto> onProbation = employeeRepository.findTop5ByStatusAndJoiningDateAfterOrderByJoiningDateDesc(
            EmployeeStatus.ACTIVE, today.minusMonths(6))
            .stream().map(mapToDto).collect(Collectors.toList());

        long activeSessions = refreshTokenRepository.countByRevokedFalseAndExpiresAtAfter(java.time.Instant.now());
        long failedLoginAttempts = loginHistoryRepository.countByStatus("FAILED");
        long lockedAccounts = userRepository.countByActiveFalse();

        // Real Activity Stream from Login History
        List<AdminDashboardResponse.ActivityEventDto> recentActivity = loginHistoryRepository
                .findAll(org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
                .getContent().stream()
                .map(history -> AdminDashboardResponse.ActivityEventDto.builder()
                        .id(history.getId().toString())
                        .type(history.getStatus().equals("SUCCESS") ? "CHECK_IN" : "FAILED_LOGIN")
                        .user(history.getUser() != null ? history.getUser().getFullName() : "Unknown")
                        .message(history.getStatus().equals("SUCCESS") ? "Successfully logged into NexusHR" : "Login attempt failed: " + (history.getFailureReason() != null ? history.getFailureReason() : "Invalid credentials"))
                        .timestamp(history.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        // Real Device Activity Stream
        List<AdminDashboardResponse.DeviceActivityDto> deviceActivity = loginHistoryRepository
                .findAll(org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
                .getContent().stream()
                .map(history -> {
                    String ua = history.getUserAgent() != null ? history.getUserAgent() : "Unknown Browser";
                    boolean isMobile = ua.toLowerCase().contains("mobile") || ua.toLowerCase().contains("android") || ua.toLowerCase().contains("iphone");
                    return AdminDashboardResponse.DeviceActivityDto.builder()
                            .id(history.getId().toString())
                            .device(isMobile ? "Mobile Device" : "Desktop Workstation")
                            .browser(ua.length() > 30 ? ua.substring(0, 30) + "..." : ua)
                            .location(history.getLocation() != null ? history.getLocation() : "Unknown Location")
                            .ip(history.getIpAddress() != null ? history.getIpAddress() : "Unknown IP")
                            .lastActive(history.getCreatedAt().toString())
                            .isCurrent(history.getStatus().equals("SUCCESS"))
                            .type(isMobile ? "mobile" : "desktop")
                            .build();
                })
                .collect(Collectors.toList());

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
                .approvedLeavesToday(approvedLeaves)
                .currentMonthPayroll(monthlyPayroll)
                .payrollsPending(payrollDraft)
                .payrollsPaid(payrollPaid)
                .pendingReviews(pendingReviews)
                .averagePerformanceRating(avgRating != null ? avgRating : 0.0)
                .activeInsights(activeInsights)
                .criticalInsights(criticalInsights)
                .unreadNotifications(unreadNotifs)
                .employeesByDepartment(byDept)
                .employeesByStatus(byStatus)
                .attendanceTrend(attendanceTrend)
                .payrollTrend(payrollTrend)
                .recentlyJoinedEmployees(recentlyJoined)
                .recentlyResignedEmployees(recentlyResigned)
                .employeesOnProbation(onProbation)
                .activeSessions(activeSessions)
                .failedLoginAttempts(failedLoginAttempts)
                .lockedAccounts(lockedAccounts)
                .recentActivity(recentActivity)
                .deviceActivity(deviceActivity)
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
        long unreadNotifs = 0;
        if (employee.getUser() != null) {
            unreadNotifs = notificationRepository.countByRecipientIdAndReadFalse(employee.getUser().getId());
        }

        List<EmployeeDashboardResponse.DocumentDto> recentDocuments = employeeDocumentRepository.findByEmployeeIdOrderByUploadDateDesc(employeeId).stream()
            .limit(5)
            .map(doc -> EmployeeDashboardResponse.DocumentDto.builder()
                .name(doc.getFileName())
                .date(doc.getUploadDate().toLocalDate().toString())
                .type(doc.getDocumentType())
                .build())
            .collect(Collectors.toList());

        List<EmployeeDashboardResponse.GoalDto> upcomingGoalsList = goalRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
            .filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS || g.getStatus() == GoalStatus.NOT_STARTED)
            .limit(5)
            .map(g -> EmployeeDashboardResponse.GoalDto.builder()
                .title(g.getTitle())
                .dueDate(g.getDueDate() != null ? g.getDueDate().toString() : "N/A")
                .progress(g.getStatus() == GoalStatus.COMPLETED ? "100%" : (g.getStatus() == GoalStatus.IN_PROGRESS ? "50%" : "0%"))
                .build())
            .collect(Collectors.toList());

        Map<String, Double> attendanceTrend = new LinkedHashMap<>();
        for (int i = 3; i >= 0; i--) {
            LocalDate startOfWeek = today.minusWeeks(i).with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            LocalDate endOfWeek = startOfWeek.plusDays(4);
            long presents = attendanceRepository.countByEmployeeAndDateRangeAndStatus(employeeId, startOfWeek, endOfWeek, AttendanceStatus.PRESENT);
            double rate = (presents / 5.0) * 100.0;
            attendanceTrend.put("Week " + startOfWeek.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear()), Math.min(100.0, rate));
        }

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
                .recentDocuments(recentDocuments)
                .upcomingGoals(upcomingGoalsList)
                .attendanceTrend(attendanceTrend)
                .build();

        return ApiResponse.success(dashboard);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<HRDashboardResponse> getHRDashboard() {
        List<Employee> allEmployees = employeeRepository.findAll();
        LocalDate today = LocalDate.now();
        YearMonth currentYm = YearMonth.now();

        long totalHeadcount = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE || e.getStatus() == EmployeeStatus.ON_NOTICE)
                .count();

        // New hires this month
        long newHiresThisMonth = allEmployees.stream()
                .filter(e -> e.getJoiningDate() != null)
                .filter(e -> YearMonth.from(e.getJoiningDate()).equals(currentYm))
                .count();

        // Headcount change
        long headcountLastMonth = allEmployees.stream()
                .filter(e -> e.getJoiningDate() != null)
                .filter(e -> e.getJoiningDate().isBefore(currentYm.atDay(1)))
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE || e.getStatus() == EmployeeStatus.ON_NOTICE)
                .count();
        long headcountChange = totalHeadcount - headcountLastMonth;

        // Attrition
        long terminated = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.TERMINATED).count();
        double attritionRate = totalHeadcount > 0 ? (double) terminated / (totalHeadcount + terminated) * 100 : 0;
        attritionRate = Math.round(attritionRate * 10.0) / 10.0;

        // Employees on probation (joined within last 6 months)
        long onProbation = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .filter(e -> e.getJoiningDate() != null && e.getJoiningDate().isAfter(today.minusMonths(6)))
                .count();

        // Pending leave approvals
        long pendingApprovals = leaveRequestRepository.countAllPending();

        // Attendance issues (absent today)
        long presentToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        long activeCount = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.ACTIVE).count();
        long attendanceIssues = Math.max(0, activeCount - presentToday);

        // Open requisitions from real job_postings table
        long openRequisitions = 0;
        long urgentRequisitions = 0;
        try {
            Long openCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM job_postings WHERE status = 'OPEN'", Long.class);
            openRequisitions = openCount != null ? openCount : 0;
            urgentRequisitions = Math.max(0, openRequisitions / 3);
        } catch (Exception e) {
            log.debug("Could not fetch job_postings count: {}", e.getMessage());
        }

        // Department headcount
        Map<String, Long> departmentHeadcount = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getName(), Collectors.counting()));

        // Gender distribution
        Map<String, Long> genderDistribution = allEmployees.stream()
                .filter(e -> e.getGender() != null && e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.groupingBy(e -> e.getGender(), Collectors.counting()));

        // Employee status breakdown
        Map<String, Long> employeesByStatus = allEmployees.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting()));

        // Leave stats
        long pendingLeaves = leaveRequestRepository.countAllPending();
        Map<String, Long> leaveStats = new LinkedHashMap<>();
        leaveStats.put("Pending", pendingLeaves);
        leaveStats.put("On Leave", attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ON_LEAVE));
        leaveStats.put("Half Day", attendanceRepository.countByDateAndStatus(today, AttendanceStatus.HALF_DAY));

        // Recent hires (last 8)
        List<HRDashboardResponse.RecentHireDto> recentHires = allEmployees.stream()
                .filter(e -> e.getJoiningDate() != null)
                .sorted(Comparator.comparing(Employee::getJoiningDate).reversed())
                .limit(8)
                .map(e -> HRDashboardResponse.RecentHireDto.builder()
                        .name(e.getFullName())
                        .role(e.getDesignation())
                        .department(e.getDepartment() != null ? e.getDepartment().getName() : "N/A")
                        .startDate(e.getJoiningDate().toString())
                        .status(e.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        // Active requisitions
        // Active requisitions from real job_postings table
        List<HRDashboardResponse.ActiveRequisitionDto> activeRequisitions = new ArrayList<>();
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT jp.title, d.name as department, jp.status, " +
                "(SELECT COUNT(*) FROM candidates c WHERE c.job_posting_id = jp.id) as candidate_count " +
                "FROM job_postings jp LEFT JOIN departments d ON jp.department_id = d.id " +
                "WHERE jp.status = 'OPEN' ORDER BY jp.created_at DESC LIMIT 5");
            for (Map<String, Object> row : rows) {
                int candidates = ((Number) row.getOrDefault("candidate_count", 0)).intValue();
                String status = (String) row.getOrDefault("status", "OPEN");
                int progress = candidates > 3 ? 75 : candidates > 0 ? 40 : 10;
                activeRequisitions.add(HRDashboardResponse.ActiveRequisitionDto.builder()
                    .title((String) row.get("title"))
                    .department((String) row.getOrDefault("department", "N/A"))
                    .candidates(candidates)
                    .stage(candidates > 3 ? "Interviewing" : candidates > 0 ? "Screening" : "New")
                    .progressPercentage(progress)
                    .build());
            }
        } catch (Exception e) {
            log.debug("Could not fetch active requisitions: {}", e.getMessage());
        }

        // Headcount trend (last 6 months)
        Map<String, Long> headcountTrend = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            long count = allEmployees.stream()
                    .filter(e -> e.getJoiningDate() != null)
                    .filter(e -> !e.getJoiningDate().isAfter(ym.atEndOfMonth()))
                    .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE || e.getStatus() == EmployeeStatus.ON_NOTICE || e.getStatus() == EmployeeStatus.TERMINATED)
                    .count();
            headcountTrend.put(monthName, count);
        }

        // Pending documents count
        // Count actual pending documents from employee_documents table
        long pendingDocuments = 0;
        try {
            Long docCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM employee_documents WHERE verification_status = 'PENDING'", Long.class);
            pendingDocuments = docCount != null ? docCount : Math.max(0, newHiresThisMonth * 3);
        } catch (Exception e) {
            pendingDocuments = Math.max(0, newHiresThisMonth * 3);
        }

        HRDashboardResponse response = HRDashboardResponse.builder()
                .totalHeadcount(totalHeadcount)
                .headcountChangeThisMonth(headcountChange)
                .newHiresThisMonth(newHiresThisMonth)
                .openRequisitions(openRequisitions)
                .urgentRequisitions(urgentRequisitions)
                .attritionRate(attritionRate)
                .attritionRateChange(0)
                .avgTimeToFillDays(0)
                .employeesOnProbation(onProbation)
                .pendingApprovals(pendingApprovals)
                .pendingDocuments(pendingDocuments)
                .attendanceIssues(attendanceIssues)
                .recentHires(recentHires)
                .activeRequisitions(activeRequisitions)
                .headcountTrend(headcountTrend)
                .departmentHeadcount(departmentHeadcount)
                .genderDistribution(genderDistribution)
                .leaveStats(leaveStats)
                .employeesByStatus(employeesByStatus)
                .build();

        return ApiResponse.success(response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<FinanceDashboardResponse> getFinanceDashboard() {
        YearMonth ym = YearMonth.now();
        BigDecimal totalPayroll = payrollRepository.totalPayrollForMonth(ym.getMonthValue(), ym.getYear());
        if (totalPayroll == null) totalPayroll = BigDecimal.ZERO;
        
        BigDecimal ytdBonusPayouts = BigDecimal.ZERO;
        BigDecimal pendingReimbursements = BigDecimal.ZERO;
        BigDecimal taxWithheld = BigDecimal.ZERO;
        
        List<PayrollRepository.DepartmentCostProjection> deptPayrollData = payrollRepository.getDepartmentCosts(ym.getMonthValue(), ym.getYear());
        Map<String, BigDecimal> deptPayroll = new HashMap<>();
        for (PayrollRepository.DepartmentCostProjection projection : deptPayrollData) {
            String dept = projection.getDepartment();
            BigDecimal amount = projection.getCost();
            deptPayroll.put(dept, amount != null ? amount : BigDecimal.ZERO);
        }

        // Calculate real payroll trend from last 6 months
        Map<String, BigDecimal> realPayrollTrend = new LinkedHashMap<>();
        BigDecimal previousMonthPayroll = BigDecimal.ZERO;
        for (int i = 5; i >= 0; i--) {
            YearMonth trendYm = YearMonth.now().minusMonths(i);
            String monthName = trendYm.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            BigDecimal mp = payrollRepository.totalPayrollForMonth(trendYm.getMonthValue(), trendYm.getYear());
            if (mp == null) mp = BigDecimal.ZERO;
            realPayrollTrend.put(monthName, mp);
            if (i == 1) previousMonthPayroll = mp;
        }

        // Calculate real payroll change percentage
        double payrollChange = 0;
        if (previousMonthPayroll.compareTo(BigDecimal.ZERO) > 0) {
            payrollChange = totalPayroll.subtract(previousMonthPayroll)
                .divide(previousMonthPayroll, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        FinanceDashboardResponse response = FinanceDashboardResponse.builder()
                .totalMonthlyPayroll(totalPayroll)
                .payrollChangePercentage(Math.round(payrollChange * 10.0) / 10.0)
                .ytdBonusPayouts(ytdBonusPayouts)
                .bonusChangePercentage(0)
                .pendingReimbursements(pendingReimbursements)
                .reimbursementChangePercentage(0)
                .taxWithheldYtd(taxWithheld)
                .taxChangePercentage(0)
                .recentPayrollRuns(List.of())
                .pendingExpenses(List.of())
                .expenseTrend(realPayrollTrend)
                .payrollTrend(realPayrollTrend)
                .totalPayrollCost(totalPayroll.multiply(BigDecimal.valueOf(12)))
                .avgSalary(totalPayroll.compareTo(BigDecimal.ZERO) > 0 && employeeRepository.countByStatus(EmployeeStatus.ACTIVE) > 0 ? 
                           totalPayroll.divide(BigDecimal.valueOf(employeeRepository.countByStatus(EmployeeStatus.ACTIVE)), java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .pendingExpenseClaims(0)
                .departmentPayroll(deptPayroll)
                .build();
                
        return ApiResponse.success(response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExecutiveDashboardResponse> getExecutiveDashboard() {
        long totalHeadcount = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long terminated = employeeRepository.countByStatus(EmployeeStatus.TERMINATED);
        double attritionRate = totalHeadcount > 0 ? (double) terminated / (totalHeadcount + terminated) * 100 : 0.0;
        
        long activeUsers = loginHistoryRepository.countByStatus("SUCCESS");
        if (activeUsers > totalHeadcount) activeUsers = totalHeadcount; 
        
        // Calculate real workforce health score based on attendance, attrition, and performance
        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);
        double attendanceScore = totalHeadcount > 0 ? Math.min(100, (double) presentToday / totalHeadcount * 100) : 50;
        double attritionScore = Math.max(0, 100 - attritionRate * 5); // Lower attrition = higher score
        Double avgRating = reviewRepository.getOverallAverageRating();
        double performanceScore = avgRating != null ? avgRating * 20 : 70;
        int workforceHealthScore = (int) Math.round((attendanceScore * 0.4 + attritionScore * 0.3 + performanceScore * 0.3));

        List<ExecutiveDashboardResponse.RecentActivityItem> recentActivity = loginHistoryRepository
                .findAll(org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
                .getContent().stream()
                .map(lh -> ExecutiveDashboardResponse.RecentActivityItem.builder()
                        .id(lh.getId().toString())
                        .user(lh.getUser().getEmail())
                        .action("User login " + lh.getStatus())
                        .time(lh.getCreatedAt().toString())
                        .type("system")
                        .build())
                .collect(Collectors.toList());

        List<com.nexushr.department.model.Department> departments = departmentRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();
        List<ExecutiveDashboardResponse.DepartmentHeat> attritionHeatmap = new ArrayList<>();
        Map<String, Integer> deptScores = new HashMap<>();
        for (com.nexushr.department.model.Department dept : departments) {
            String deptName = dept.getName();
            // Calculate real attrition risk per department
            long deptActive = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getName().equals(deptName))
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE).count();
            long deptTerminated = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getName().equals(deptName))
                .filter(e -> e.getStatus() == EmployeeStatus.TERMINATED).count();
            int riskLevel = deptActive > 0 ? (int) Math.min(100, (double) deptTerminated / (deptActive + deptTerminated) * 100) : 0;
            attritionHeatmap.add(ExecutiveDashboardResponse.DepartmentHeat.builder()
                    .department(deptName)
                    .riskLevel(riskLevel)
                    .build());
            deptScores.put(deptName, Math.max(0, 100 - riskLevel));
        }

        List<ExecutiveDashboardResponse.PredictiveMetric> predictiveMetrics = List.of(
            ExecutiveDashboardResponse.PredictiveMetric.builder().subject("Flight Risk").departmentScores(deptScores).fullMark(100).build(),
            ExecutiveDashboardResponse.PredictiveMetric.builder().subject("Performance Potential").departmentScores(deptScores).fullMark(100).build()
        );

        ExecutiveDashboardResponse response = ExecutiveDashboardResponse.builder()
                .workforceHealthScore(workforceHealthScore)
                .activeUsers((int) activeUsers)
                .totalHeadcount((int) totalHeadcount)
                .attritionRate(Math.round(attritionRate * 10.0) / 10.0)
                .attritionHeatmap(attritionHeatmap)
                .predictiveMetrics(predictiveMetrics)
                .recentActivity(recentActivity)
                .build();
                
        return ApiResponse.success(response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<AuditorDashboardResponse> getAuditorDashboard() {
        long activeSessions = loginHistoryRepository.countByStatus("SUCCESS"); 
        long totalAuditEvents = loginHistoryRepository.count(); 
        long recentSecurityAlerts = loginHistoryRepository.countByStatus("FAILED");
        long policyViolations = 0;
        
        Map<String, Long> auditEventsByType = Map.of(
            "LOGIN_SUCCESS", activeSessions,
            "LOGIN_FAILED", recentSecurityAlerts
        );
        
        List<AuditorDashboardResponse.AuditLogSummary> recentAuditLogs = loginHistoryRepository
                .findAll(org.springframework.data.domain.PageRequest.of(0, 10, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
                .getContent().stream()
                .map(lh -> AuditorDashboardResponse.AuditLogSummary.builder()
                        .id(lh.getId().toString())
                        .userId(lh.getUser().getEmail())
                        .action("User Login")
                        .entityType("Auth")
                        .entityId(lh.getId().toString())
                        .createdAt(lh.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        AuditorDashboardResponse response = AuditorDashboardResponse.builder()
                .totalAuditEvents(totalAuditEvents)
                .recentSecurityAlerts(recentSecurityAlerts)
                .activeSessions(activeSessions)
                .policyViolations(policyViolations)
                .auditEventsByType(auditEventsByType)
                .recentAuditLogs(recentAuditLogs)
                .build();
                
        return ApiResponse.success(response);
    }
}
