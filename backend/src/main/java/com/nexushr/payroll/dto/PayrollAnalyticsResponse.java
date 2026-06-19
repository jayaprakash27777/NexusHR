package com.nexushr.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PayrollAnalyticsResponse {

    private List<MonthlyCostDto> monthlyCosts;
    private List<DepartmentCostDto> departmentCosts;
    private List<SalaryDistributionDto> salaryDistribution;

    @Data
    @Builder
    public static class MonthlyCostDto {
        private String label; // e.g., "Jan 2026"
        private BigDecimal cost;
    }

    @Data
    @Builder
    public static class DepartmentCostDto {
        private String department;
        private BigDecimal cost;
    }

    @Data
    @Builder
    public static class SalaryDistributionDto {
        private String range; // e.g., "0-50K"
        private long count;
    }
}
