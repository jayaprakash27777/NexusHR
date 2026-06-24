package com.nexushr.ai.service;

import com.nexushr.attendance.repository.AttendanceRepository;
import com.nexushr.department.model.Department;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.repository.LeaveRequestRepository;
import com.nexushr.payroll.repository.PayrollRepository;
import com.nexushr.performance.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RuleBasedAnalyticsEngine {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PerformanceReviewRepository reviewRepository;
    private final PayrollRepository payrollRepository;

    public String generateWorkforceSummary() {
        long total = employeeRepository.count();
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long terminated = employeeRepository.countByStatus(EmployeeStatus.TERMINATED);
        
        Double avgRating = reviewRepository.getOverallAverageRating();
        double rating = avgRating != null ? avgRating : 0.0;
        
        long pendingLeaves = leaveRequestRepository.countAllPending();
        
        StringBuilder summary = new StringBuilder();
        summary.append(String.format("Organization health overview: Current active headcount is %d out of %d total records. ", active, total));
        
        if (terminated > 0) {
            double turnoverRate = (double) terminated / total * 100;
            summary.append(String.format("Historical turnover rate is %.1f%%. ", turnoverRate));
        }
        
        if (rating > 0) {
            summary.append(String.format("Average organizational performance rating is %.2f out of 5.0. ", rating));
        }
        
        if (pendingLeaves > 10) {
            summary.append(String.format("There are %d pending leave requests requiring manager attention. ", pendingLeaves));
        }
        
        return summary.toString();
    }

    public String generateDepartmentInsight(Department dept, long empCount) {
        Double avgRatingObj = reviewRepository.getOverallAverageRating(); // Ideally should be by dept, but we'll approximate
        
        StringBuilder insight = new StringBuilder();
        insight.append(String.format("The %s department currently has %d active employees. ", dept.getName(), empCount));
        
        if (empCount < 3) {
            insight.append("This is a small team; consider cross-training to avoid key-person dependencies. ");
        } else if (empCount > 20) {
            insight.append("This is a large team; ensure middle management structures are robust. ");
        }
        
        // Cost trend logic: get department cost from previous months
        LocalDate now = LocalDate.now();
        List<PayrollRepository.DepartmentCostProjection> costs = payrollRepository.getDepartmentCosts(now.getMonthValue(), now.getYear());
        java.math.BigDecimal currentCost = costs.stream()
                .filter(c -> dept.getName().equals(c.getDepartment()))
                .map(PayrollRepository.DepartmentCostProjection::getCost)
                .findFirst()
                .orElse(java.math.BigDecimal.ZERO);
                
        if (currentCost.compareTo(java.math.BigDecimal.ZERO) > 0) {
            insight.append(String.format("Current monthly payroll cost for this department is roughly %s. ", currentCost.toString()));
        }

        return insight.toString();
    }

    public String generateRecommendations() {
        return "Based on statistical trends, we recommend the following actions:\n" +
               "1. Address pending performance reviews to improve employee feedback loops.\n" +
               "2. Monitor departments with high overtime or low leave utilization to prevent burnout.\n" +
               "3. Ensure competitive compensation for employees flagged as high attrition risk.";
    }

    public static class AttritionRiskResult {
        public final double score;
        public final String detail;

        public AttritionRiskResult(double score, String detail) {
            this.score = score;
            this.detail = detail;
        }
    }

    public AttritionRiskResult calculateAttritionRisk(Employee emp) {
        double score = 0.0;
        StringBuilder details = new StringBuilder();

        // 1. Tenure analysis (Risk peaks around 2-3 years without promotion)
        if (emp.getJoiningDate() != null) {
            long years = ChronoUnit.YEARS.between(emp.getJoiningDate(), LocalDate.now());
            if (years >= 2 && years <= 4) {
                score += 0.3;
                details.append("- Employee is in the 2-4 year tenure window, statistically prone to attrition.\n");
            } else if (years > 4) {
                score -= 0.1; // Loyalty
                details.append("- Long tenure indicates higher loyalty.\n");
            }
        }

        // 2. Performance Analysis
        Double avgRating = reviewRepository.getAverageRating(emp.getId());
        if (avgRating != null) {
            if (avgRating < 2.5) {
                score += 0.4;
                details.append(String.format("- Recent performance ratings are below average (%.1f/5), indicating potential disengagement.\n", avgRating));
            } else if (avgRating > 4.5) {
                score += 0.2; // High performers have high flight risk if not compensated
                details.append("- Top performer flight risk. Ensure compensation remains highly competitive.\n");
            }
        }

        // 3. Compensation Analysis
        if (emp.getDepartment() != null && emp.getSalary() != null) {
            List<Employee> peers = employeeRepository.findByDepartmentId(emp.getDepartment().getId());
            double avgSalary = peers.stream()
                    .map(e -> e.getSalary().doubleValue())
                    .mapToDouble(Double::doubleValue)
                    .average().orElse(0.0);
            
            if (avgSalary > 0 && emp.getSalary().doubleValue() < avgSalary * 0.85) {
                score += 0.3;
                details.append("- Compensation is more than 15% below department average.\n");
            }
        }

        // Normalize score between 0.1 and 0.95
        score = Math.max(0.1, Math.min(0.95, score));
        
        if (details.length() == 0) {
            details.append("- No significant risk factors identified based on available data.");
        }

        return new AttritionRiskResult(score, details.toString());
    }
}
