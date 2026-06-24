package com.nexushr.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class FinanceDashboardResponse {
    private BigDecimal totalMonthlyPayroll;
    private double payrollChangePercentage;
    private BigDecimal ytdBonusPayouts;
    private double bonusChangePercentage;
    private BigDecimal pendingReimbursements;
    private double reimbursementChangePercentage;
    private BigDecimal taxWithheldYtd;
    private double taxChangePercentage;

    private List<PayrollRunDto> recentPayrollRuns;
    private List<ExpenseDto> pendingExpenses;
    private java.util.Map<String, BigDecimal> expenseTrend;
    private java.util.Map<String, BigDecimal> payrollTrend;

    @Data
    @Builder
    public static class PayrollRunDto {
        private String month;
        private String status;
        private String amount;
        private String date;
    }

    @Data
    @Builder
    public static class ExpenseDto {
        private String description;
        private String employeeName;
        private String amount;
        private String date;
    }
}
