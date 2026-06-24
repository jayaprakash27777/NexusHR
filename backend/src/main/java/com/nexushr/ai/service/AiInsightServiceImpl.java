package com.nexushr.ai.service;

import com.nexushr.ai.dto.AiInsightResponse;
import com.nexushr.ai.dto.WorkforceAnalyticsResponse;
import com.nexushr.ai.model.AiInsight;
import com.nexushr.ai.model.InsightPriority;
import com.nexushr.ai.model.InsightType;
import com.nexushr.ai.repository.AiInsightRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.department.model.Department;
import com.nexushr.department.repository.DepartmentRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.repository.LeaveRequestRepository;
import com.nexushr.performance.model.ReviewStatus;
import com.nexushr.performance.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiInsightServiceImpl implements AiInsightService {

    private final AiInsightRepository insightRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PerformanceReviewRepository reviewRepository;
    private final RuleBasedAnalyticsEngine analyticsEngine;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<WorkforceAnalyticsResponse> getWorkforceAnalytics() {
        List<Employee> allEmployees = employeeRepository.findAll();

        long total = allEmployees.size();
        long active = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.ACTIVE).count();
        long onNotice = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.ON_NOTICE).count();
        long terminated = allEmployees.stream().filter(e -> e.getStatus() == EmployeeStatus.TERMINATED).count();

        BigDecimal avgSalary = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .map(Employee::getSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(active, 1)), 2, RoundingMode.HALF_UP);

        BigDecimal totalPayroll = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .map(Employee::getSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Employees by department
        Map<String, Long> byDepartment = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getName(), Collectors.counting()));

        // Employees by status
        Map<String, Long> byStatus = allEmployees.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting()));

        // Avg salary by department
        Map<String, BigDecimal> avgSalaryByDept = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment().getName(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> list.stream().map(Employee::getSalary)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .divide(BigDecimal.valueOf(list.size()), 2, RoundingMode.HALF_UP)
                        )));

        long pendingLeaves = leaveRequestRepository.countAllPending();
        long pendingReviews = reviewRepository.countByStatusAndYear(ReviewStatus.PENDING, LocalDateTime.now().getYear());

        Double avgRating = reviewRepository.getOverallAverageRating();

        // Get top insights
        List<AiInsightResponse> topInsights = insightRepository
                .findByDismissedFalseOrderByGeneratedAtDesc(PageRequest.of(0, 5))
                .stream().map(this::mapToResponse).collect(Collectors.toList());

        WorkforceAnalyticsResponse analytics = WorkforceAnalyticsResponse.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .onNoticeEmployees(onNotice)
                .terminatedEmployees(terminated)
                .averageSalary(avgSalary)
                .totalPayroll(totalPayroll)
                .employeesByDepartment(byDepartment)
                .employeesByStatus(byStatus)
                .avgSalaryByDepartment(avgSalaryByDept)
                .attendanceByDepartment(Map.of()) // Populated when attendance data is richer
                .overallAttendanceRate(92.5) // Simulated
                .pendingLeaveRequests(pendingLeaves)
                .pendingPerformanceReviews(pendingReviews)
                .averagePerformanceRating(avgRating != null ? avgRating : 0.0)
                .topInsights(topInsights)
                .build();

        return ApiResponse.success(analytics);
    }

    @Override
    @Transactional
    public ApiResponse<List<AiInsightResponse>> generateInsights() {
        List<AiInsight> generatedInsights = new ArrayList<>();

        // 1. Workforce summary insight
        String summaryText = analyticsEngine.generateWorkforceSummary();
        generatedInsights.add(createAndSaveInsight(
                InsightType.WORKFORCE_SUMMARY, "Workforce Health Summary",
                summaryText, InsightPriority.MEDIUM, null, null, true));

        // 2. Department-level insights
        List<Department> departments = departmentRepository.findByActiveTrue();
        for (Department dept : departments) {
            long empCount = departmentRepository.countActiveEmployees(dept.getId());
            if (empCount > 0) {
                String deptInsight = analyticsEngine.generateDepartmentInsight(dept, empCount);
                generatedInsights.add(createAndSaveInsight(
                        InsightType.DEPARTMENT_INSIGHT,
                        dept.getName() + " Department Analysis",
                        deptInsight, InsightPriority.LOW, null, dept.getId(), false));
            }
        }

        // 3. Recommendations
        String recText = analyticsEngine.generateRecommendations();
        generatedInsights.add(createAndSaveInsight(
                InsightType.RECOMMENDATION, "Analytics Recommendation",
                recText, InsightPriority.MEDIUM, null, null, true));

        // 4. Attrition risk for random sample of employees
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.toList());

        int sampleSize = Math.min(3, activeEmployees.size());
        Collections.shuffle(activeEmployees);
        for (int i = 0; i < sampleSize; i++) {
            Employee emp = activeEmployees.get(i);
            RuleBasedAnalyticsEngine.AttritionRiskResult riskResult = analyticsEngine.calculateAttritionRisk(emp);
            double risk = riskResult.score;
            InsightPriority priority = risk > 0.6 ? InsightPriority.HIGH
                    : risk > 0.4 ? InsightPriority.MEDIUM : InsightPriority.LOW;
            String riskText = String.format(
                    "Attrition risk score for %s (%s): %.0f%%.\n\n%s",
                    emp.getFullName(), emp.getEmployeeId(), risk * 100,
                    riskResult.detail);
            generatedInsights.add(createAndSaveInsight(
                    InsightType.ATTRITION_RISK,
                    "Attrition Risk: " + emp.getFullName(),
                    riskText, priority, emp.getId(), null, true));
        }

        List<AiInsightResponse> responses = generatedInsights.stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        log.info("Generated {} insights using RuleBasedAnalyticsEngine", responses.size());
        return ApiResponse.success("Generated " + responses.size() + " insights", responses);
    }

    @Override
    @Transactional
    public ApiResponse<AiInsightResponse> generateAttritionRisk(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        RuleBasedAnalyticsEngine.AttritionRiskResult riskResult = analyticsEngine.calculateAttritionRisk(employee);
        double risk = riskResult.score;
        String detail = riskResult.detail;
        InsightPriority priority = risk > 0.6 ? InsightPriority.HIGH
                : risk > 0.4 ? InsightPriority.MEDIUM : InsightPriority.LOW;

        String description = String.format(
                "Attrition risk assessment for %s (%s, %s):\n\nRisk Score: %.0f%%\n\n%s",
                employee.getFullName(), employee.getEmployeeId(),
                employee.getDepartment() != null ? employee.getDepartment().getName() : "N/A",
                risk * 100, detail);

        AiInsight insight = createAndSaveInsight(
                InsightType.ATTRITION_RISK,
                "Attrition Risk: " + employee.getFullName(),
                description, priority, employeeId, null, true);

        return ApiResponse.success(mapToResponse(insight));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AiInsightResponse> getActiveInsights(int page, int size) {
        Page<AiInsight> insightPage = insightRepository
                .findByDismissedFalseOrderByGeneratedAtDesc(PageRequest.of(page, size));

        List<AiInsightResponse> content = insightPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return PagedResponse.<AiInsightResponse>builder()
                .content(content)
                .page(insightPage.getNumber())
                .size(insightPage.getSize())
                .totalElements(insightPage.getTotalElements())
                .totalPages(insightPage.getTotalPages())
                .last(insightPage.isLast())
                .first(insightPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AiInsightResponse>> getInsightsByType(String type) {
        InsightType insightType = InsightType.valueOf(type.toUpperCase());
        List<AiInsightResponse> insights = insightRepository
                .findByInsightTypeAndDismissedFalseOrderByGeneratedAtDesc(insightType)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success(insights);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<AiInsightResponse>> getInsightsForEmployee(UUID employeeId) {
        List<AiInsightResponse> insights = insightRepository
                .findByEmployeeIdAndDismissedFalseOrderByGeneratedAtDesc(employeeId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success(insights);
    }

    @Override
    @Transactional
    public ApiResponse<Void> dismissInsight(UUID insightId) {
        AiInsight insight = insightRepository.findById(insightId)
                .orElseThrow(() -> new ResourceNotFoundException("AiInsight", "id", insightId));
        insight.setDismissed(true);
        insightRepository.save(insight);
        return ApiResponse.success("Insight dismissed");
    }

    @Override
    public ApiResponse<String> getAiProviderInfo() {
        return ApiResponse.success("AI Provider: Internal Analytics Engine", "Internal Analytics Engine");
    }

    private AiInsight createAndSaveInsight(InsightType type, String title, String description,
                                           InsightPriority priority, UUID employeeId, UUID departmentId,
                                           boolean actionable) {
        AiInsight insight = AiInsight.builder()
                .insightType(type)
                .title(title)
                .description(description)
                .priority(priority)
                .employeeId(employeeId)
                .departmentId(departmentId)
                .actionable(actionable)
                .generatedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        return insightRepository.save(insight);
    }

    private AiInsightResponse mapToResponse(AiInsight i) {
        String empName = null;
        String deptName = null;
        if (i.getEmployeeId() != null) {
            empName = employeeRepository.findById(i.getEmployeeId())
                    .map(Employee::getFullName).orElse(null);
        }
        if (i.getDepartmentId() != null) {
            deptName = departmentRepository.findById(i.getDepartmentId())
                    .map(Department::getName).orElse(null);
        }

        return AiInsightResponse.builder()
                .id(i.getId())
                .insightType(i.getInsightType())
                .title(i.getTitle())
                .description(i.getDescription())
                .priority(i.getPriority())
                .category(i.getCategory())
                .dataJson(i.getDataJson())
                .employeeId(i.getEmployeeId())
                .employeeName(empName)
                .departmentId(i.getDepartmentId())
                .departmentName(deptName)
                .actionable(i.isActionable())
                .dismissed(i.isDismissed())
                .generatedAt(i.getGeneratedAt())
                .build();
    }
}
