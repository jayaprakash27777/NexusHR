package com.nexushr.payroll.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.payroll.dto.PayrollProcessRequest;
import com.nexushr.payroll.dto.PayrollResponse;
import com.nexushr.payroll.dto.PayrollSummaryResponse;
import com.nexushr.payroll.model.Payroll;
import com.nexushr.payroll.model.PayrollStatus;
import com.nexushr.payroll.model.PayrollAuditLog;
import com.nexushr.payroll.model.TaxSlab;
import com.nexushr.payroll.repository.PayrollRepository;
import com.nexushr.payroll.repository.PayrollAuditLogRepository;
import com.nexushr.payroll.repository.TaxSlabRepository;
import com.nexushr.payroll.repository.SalaryStructureRepository;
import com.nexushr.payroll.model.SalaryStructure;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final TaxSlabRepository taxSlabRepository;
    private final PayrollAuditLogRepository auditLogRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    // Salary component percentages
    private static final BigDecimal HRA_PERCENT = new BigDecimal("0.40");       // 40% of basic
    private static final BigDecimal DA_PERCENT = new BigDecimal("0.10");        // 10% of basic
    private static final BigDecimal PF_PERCENT = new BigDecimal("0.12");        // 12% of basic
    private static final BigDecimal PROFESSIONAL_TAX = new BigDecimal("200");   // Flat ₹200/month

    @Override
    @Transactional
    public ApiResponse<PayrollResponse> processPayroll(PayrollProcessRequest request) {
        if (request.getEmployeeId() == null) {
            throw new BadRequestException("Employee ID is required for single processing. Use batch endpoint for all employees.");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        if (payrollRepository.existsByEmployeeIdAndMonthAndYear(
                request.getEmployeeId(), request.getMonth(), request.getYear())) {
            throw new BadRequestException("Payroll already exists for " + employee.getFullName() +
                    " for " + request.getMonth() + "/" + request.getYear());
        }

        Payroll payroll = calculatePayroll(employee, request.getMonth(), request.getYear(),
                request.getBonus(), request.getOtherAllowances(), request.getOtherDeductions());

        Payroll saved = payrollRepository.save(payroll);
        log.info("Payroll processed for {} ({}/{}): Net ₹{}",
                employee.getEmployeeId(), request.getMonth(), request.getYear(), saved.getNetSalary());

        return ApiResponse.success("Payroll processed successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<List<PayrollResponse>> batchProcessPayroll(int month, int year) {
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .collect(Collectors.toList());

        List<PayrollResponse> results = new ArrayList<>();
        int processed = 0;
        int skipped = 0;

        for (Employee employee : activeEmployees) {
            if (payrollRepository.existsByEmployeeIdAndMonthAndYear(employee.getId(), month, year)) {
                skipped++;
                continue;
            }

            Payroll payroll = calculatePayroll(employee, month, year, null, null, null);
            Payroll saved = payrollRepository.save(payroll);
            results.add(mapToResponse(saved));
            processed++;
        }

        log.info("Batch payroll processed for {}/{}: {} processed, {} skipped", month, year, processed, skipped);
        
        if (processed > 0) {
            logAudit(month, year, "BATCH_PROCESSED", "Processed payroll for " + processed + " employees");
        }
        
        return ApiResponse.success(
                String.format("Batch payroll complete: %d processed, %d skipped (already exist)", processed, skipped),
                results);
    }

    @Override
    @Transactional
    public ApiResponse<PayrollResponse> markAsPaid(UUID payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));

        if (payroll.getStatus() == PayrollStatus.PAID) {
            throw new BadRequestException("Payroll is already marked as paid");
        }
        if (payroll.getStatus() != PayrollStatus.LOCKED) {
            throw new BadRequestException("Payroll must be LOCKED before marking as PAID");
        }

        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaidAt(LocalDateTime.now());
        Payroll saved = payrollRepository.save(payroll);

        log.info("Payroll marked as paid: {} for {}", payrollId, payroll.getEmployee().getEmployeeId());
        return ApiResponse.success("Payroll marked as paid", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<PayrollResponse> reversePayroll(UUID payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));

        if (payroll.getStatus() == PayrollStatus.REVERSED) {
            throw new BadRequestException("Payroll is already reversed");
        }

        payroll.setStatus(PayrollStatus.REVERSED);
        Payroll saved = payrollRepository.save(payroll);

        logAudit(payroll.getMonth(), payroll.getYear(), "REVERSED", "Reversed payroll for " + payroll.getEmployee().getEmployeeId());
        log.info("Payroll reversed: {} for {}", payrollId, payroll.getEmployee().getEmployeeId());
        
        return ApiResponse.success("Payroll reversed successfully", mapToResponse(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PayrollResponse> getById(UUID payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));
        return ApiResponse.success(mapToResponse(payroll));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PayrollResponse> getByEmployeeAndMonth(UUID employeeId, int month, int year) {
        Payroll payroll = payrollRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll",
                        "employeeId/month/year", employeeId + "/" + month + "/" + year));
        return ApiResponse.success(mapToResponse(payroll));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PayrollResponse> getEmployeePayrollHistory(UUID employeeId, int page, int size) {
        Page<Payroll> payrollPage = payrollRepository.findByEmployeeIdOrderByYearDescMonthDesc(
                employeeId, PageRequest.of(page, size));

        List<PayrollResponse> content = payrollPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return PagedResponse.<PayrollResponse>builder()
                .content(content)
                .page(payrollPage.getNumber())
                .size(payrollPage.getSize())
                .totalElements(payrollPage.getTotalElements())
                .totalPages(payrollPage.getTotalPages())
                .last(payrollPage.isLast())
                .first(payrollPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PayrollResponse>> getMonthlyPayroll(int month, int year) {
        List<PayrollResponse> payrolls = payrollRepository
                .findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success(payrolls);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PayrollResponse> searchMonthlyPayroll(int month, int year, String search, String department, int page, int size, String sort, String dir) {
        org.springframework.data.domain.Sort.Direction direction = dir.equalsIgnoreCase("desc") ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC;
        
        // Map sort fields from frontend to backend entity fields
        String entitySortField = "employee.firstName";
        if ("employeeName".equals(sort)) entitySortField = "employee.firstName";
        if ("employeeCode".equals(sort)) entitySortField = "employee.employeeId";
        if ("departmentName".equals(sort)) entitySortField = "employee.department.name";
        if ("basicSalary".equals(sort)) entitySortField = "basicSalary";
        if ("totalDeductions".equals(sort)) entitySortField = "totalDeductions";
        if ("bonus".equals(sort)) entitySortField = "bonus";
        if ("netSalary".equals(sort)) entitySortField = "netSalary";
        
        PageRequest pageRequest = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, entitySortField));
        
        String searchParam = (search != null && search.trim().isEmpty()) ? null : search;
        String deptParam = (department != null && department.trim().isEmpty() || "ALL".equalsIgnoreCase(department)) ? null : department;

        Page<Payroll> payrollPage = payrollRepository.searchMonthlyPayroll(month, year, searchParam, deptParam, pageRequest);

        List<PayrollResponse> content = payrollPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return PagedResponse.<PayrollResponse>builder()
                .content(content)
                .page(payrollPage.getNumber())
                .size(payrollPage.getSize())
                .totalElements(payrollPage.getTotalElements())
                .totalPages(payrollPage.getTotalPages())
                .last(payrollPage.isLast())
                .first(payrollPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PayrollSummaryResponse> getMonthlyPayrollSummary(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        
        long totalEmployeesProcessed = payrolls.size();
        long totalPaid = payrolls.stream().filter(p -> p.getStatus() == PayrollStatus.PAID).count();
        long totalApproved = payrolls.stream().filter(p -> p.getStatus() == PayrollStatus.APPROVED).count();
        long totalLocked = payrolls.stream().filter(p -> p.getStatus() == PayrollStatus.LOCKED).count();
        long totalPending = totalEmployeesProcessed - totalPaid;

        BigDecimal totalGross = payrolls.stream()
                .map(Payroll::getGrossSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = payrolls.stream()
                .map(Payroll::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDed = payrolls.stream()
                .map(Payroll::getTotalDeductions)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageSalary = BigDecimal.ZERO;
        if (totalEmployeesProcessed > 0) {
            averageSalary = totalGross.divide(BigDecimal.valueOf(totalEmployeesProcessed), 2, RoundingMode.HALF_UP);
        }

        String currentCycle = java.time.Month.of(month).getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH) + " " + year;
        
        java.time.YearMonth yearMonth = java.time.YearMonth.of(year, month);
        java.time.LocalDate lastDay = yearMonth.atEndOfMonth();
        String nextPayrollDate = lastDay.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy"));

        PayrollSummaryResponse summary = PayrollSummaryResponse.builder()
                .month(month)
                .year(year)
                .totalEmployeesProcessed(totalEmployeesProcessed)
                .totalApproved(totalApproved)
                .totalLocked(totalLocked)
                .totalPaid(totalPaid)
                .totalPending(totalPending)
                .totalGrossSalary(totalGross)
                .totalNetSalary(totalNet)
                .totalDeductions(totalDed)
                .averageSalary(averageSalary)
                .currentPayrollCycle(currentCycle)
                .nextPayrollDate(nextPayrollDate)
                .build();

        return ApiResponse.success(summary);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<com.nexushr.payroll.dto.PayrollAnalyticsResponse> getAnalytics(int month, int year) {
        // 1. Department Costs
        List<com.nexushr.payroll.dto.PayrollAnalyticsResponse.DepartmentCostDto> deptCosts = payrollRepository.getDepartmentCosts(month, year)
                .stream()
                .map(p -> com.nexushr.payroll.dto.PayrollAnalyticsResponse.DepartmentCostDto.builder()
                        .department(p.getDepartment())
                        .cost(p.getCost())
                        .build())
                .collect(Collectors.toList());

        // 2. Monthly Trend
        List<com.nexushr.payroll.dto.PayrollAnalyticsResponse.MonthlyCostDto> monthlyCosts = payrollRepository.getMonthlyCosts()
                .stream()
                .map(p -> com.nexushr.payroll.dto.PayrollAnalyticsResponse.MonthlyCostDto.builder()
                        .label(java.time.Month.of(p.getMonth()).getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH) + " " + p.getYear())
                        .cost(p.getCost())
                        .build())
                .collect(Collectors.toList());
        // Reverse to show chronological order (oldest to newest)
        java.util.Collections.reverse(monthlyCosts);

        // 3. Salary Distribution
        List<Payroll> currentPayrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        long b1 = 0, b2 = 0, b3 = 0, b4 = 0;
        for (Payroll p : currentPayrolls) {
            BigDecimal net = p.getNetSalary();
            if (net.compareTo(new BigDecimal("50000")) <= 0) b1++;
            else if (net.compareTo(new BigDecimal("100000")) <= 0) b2++;
            else if (net.compareTo(new BigDecimal("150000")) <= 0) b3++;
            else b4++;
        }

        List<com.nexushr.payroll.dto.PayrollAnalyticsResponse.SalaryDistributionDto> dist = new ArrayList<>();
        dist.add(com.nexushr.payroll.dto.PayrollAnalyticsResponse.SalaryDistributionDto.builder().range("0 - 50K").count(b1).build());
        dist.add(com.nexushr.payroll.dto.PayrollAnalyticsResponse.SalaryDistributionDto.builder().range("50K - 100K").count(b2).build());
        dist.add(com.nexushr.payroll.dto.PayrollAnalyticsResponse.SalaryDistributionDto.builder().range("100K - 150K").count(b3).build());
        dist.add(com.nexushr.payroll.dto.PayrollAnalyticsResponse.SalaryDistributionDto.builder().range("150K+").count(b4).build());

        com.nexushr.payroll.dto.PayrollAnalyticsResponse response = com.nexushr.payroll.dto.PayrollAnalyticsResponse.builder()
                .departmentCosts(deptCosts)
                .monthlyCosts(monthlyCosts)
                .salaryDistribution(dist)
                .build();

        return ApiResponse.success(response);
    }

    @Override
    @Transactional
    public ApiResponse<String> approveMonthlyPayroll(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        int approved = 0;
        for (Payroll p : payrolls) {
            if (p.getStatus() == PayrollStatus.PROCESSED) {
                p.setStatus(PayrollStatus.APPROVED);
                approved++;
            }
        }
        if (approved == 0) throw new BadRequestException("No PROCESSED payrolls found to approve.");
        
        payrollRepository.saveAll(payrolls);
        logAudit(month, year, "BATCH_APPROVED", "Approved " + approved + " payroll records");
        return ApiResponse.success("Approved " + approved + " payroll records");
    }

    @Override
    @Transactional
    public ApiResponse<String> lockMonthlyPayroll(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        int locked = 0;
        for (Payroll p : payrolls) {
            if (p.getStatus() == PayrollStatus.APPROVED) {
                p.setStatus(PayrollStatus.LOCKED);
                locked++;
            }
        }
        if (locked == 0) throw new BadRequestException("No APPROVED payrolls found to lock.");
        
        payrollRepository.saveAll(payrolls);
        logAudit(month, year, "BATCH_LOCKED", "Locked " + locked + " payroll records");
        return ApiResponse.success("Locked " + locked + " payroll records");
    }

    @Override
    @Transactional
    public ApiResponse<String> unlockMonthlyPayroll(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYearOrderByEmployeeFirstNameAsc(month, year);
        int unlocked = 0;
        for (Payroll p : payrolls) {
            if (p.getStatus() == PayrollStatus.LOCKED) {
                p.setStatus(PayrollStatus.APPROVED);
                unlocked++;
            }
        }
        if (unlocked == 0) throw new BadRequestException("No LOCKED payrolls found to unlock.");
        
        payrollRepository.saveAll(payrolls);
        logAudit(month, year, "BATCH_UNLOCKED", "Unlocked " + unlocked + " payroll records");
        return ApiResponse.success("Unlocked " + unlocked + " payroll records");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<com.nexushr.payroll.dto.PayrollAuditLogResponse>> getAuditLogs(int month, int year) {
        List<com.nexushr.payroll.dto.PayrollAuditLogResponse> logs = auditLogRepository.findByMonthAndYearOrderByTimestampDesc(month, year)
                .stream().map(l -> com.nexushr.payroll.dto.PayrollAuditLogResponse.builder()
                        .id(l.getId())
                        .month(l.getMonth())
                        .year(l.getYear())
                        .action(l.getAction())
                        .actionBy(l.getActionBy())
                        .details(l.getDetails())
                        .timestamp(l.getTimestamp())
                        .build()
                ).collect(Collectors.toList());
        return ApiResponse.success(logs);
    }

    private void logAudit(int month, int year, String action, String details) {
        String username = "System";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        PayrollAuditLog logEntry = PayrollAuditLog.builder()
                .month(month)
                .year(year)
                .action(action)
                .actionBy(username)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(logEntry);
    }

    /**
     * Core payroll calculation logic:
     * Basic = employee.salary
     * HRA = 40% of Basic
     * DA = 10% of Basic
     * Gross = Basic + HRA + DA + Other Allowances
     * PF = 12% of Basic
     * Professional Tax = ₹200 flat
     * Income Tax = annual tax / 12 (from tax slabs)
     * Total Deductions = PF + Professional Tax + Income Tax + Other
     * Net = Gross - Total Deductions + Bonus
     */
    private Payroll calculatePayroll(Employee employee, int month, int year,
                                     BigDecimal bonus, BigDecimal otherAllowances, BigDecimal otherDeductions) {
        SalaryStructure activeStructure = salaryStructureRepository.findAll().stream()
                .filter(SalaryStructure::isActive)
                .findFirst()
                .orElse(null);

        BigDecimal hraPercent = activeStructure != null ? activeStructure.getHraPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : HRA_PERCENT;
        BigDecimal daPercent = activeStructure != null ? activeStructure.getDaPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : DA_PERCENT;
        BigDecimal pfPercent = activeStructure != null ? activeStructure.getPfPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : PF_PERCENT;
        BigDecimal esiPercent = activeStructure != null ? activeStructure.getEsiPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal structOtherAllow = activeStructure != null ? activeStructure.getOtherAllowances() : BigDecimal.ZERO;

        BigDecimal basic = employee.getSalary();
        BigDecimal hra = basic.multiply(hraPercent).setScale(2, RoundingMode.HALF_UP);
        BigDecimal da = basic.multiply(daPercent).setScale(2, RoundingMode.HALF_UP);
        BigDecimal combinedOtherAllow = structOtherAllow.add(otherAllowances != null ? otherAllowances : BigDecimal.ZERO);
        BigDecimal gross = basic.add(hra).add(da).add(combinedOtherAllow);

        BigDecimal pf = basic.multiply(pfPercent).setScale(2, RoundingMode.HALF_UP);
        
        // ESI Logic: typically 0.75% of Gross if gross <= 21000
        BigDecimal esi = BigDecimal.ZERO;
        if (gross.compareTo(new BigDecimal("21000")) <= 0 && esiPercent.compareTo(BigDecimal.ZERO) > 0) {
            esi = gross.multiply(esiPercent).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal profTax = PROFESSIONAL_TAX;
        BigDecimal incomeTax = calculateMonthlyIncomeTax(gross);
        BigDecimal otherDed = otherDeductions != null ? otherDeductions : BigDecimal.ZERO;
        BigDecimal totalDed = pf.add(profTax).add(incomeTax).add(esi).add(otherDed);

        BigDecimal bonusAmt = bonus != null ? bonus : BigDecimal.ZERO;
        BigDecimal net = gross.subtract(totalDed).add(bonusAmt);

        return Payroll.builder()
                .employee(employee)
                .month(month)
                .year(year)
                .basicSalary(basic)
                .hra(hra)
                .da(da)
                .otherAllowances(combinedOtherAllow)
                .grossSalary(gross)
                .pfDeduction(pf)
                .professionalTax(profTax)
                .incomeTax(incomeTax)
                .esiDeduction(esi)
                .otherDeductions(otherDed)
                .totalDeductions(totalDed)
                .bonus(bonusAmt)
                .netSalary(net)
                .status(PayrollStatus.PROCESSED)
                .processedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Calculates monthly income tax based on annual gross and tax slabs.
     */
    private BigDecimal calculateMonthlyIncomeTax(BigDecimal monthlyGross) {
        BigDecimal annualIncome = monthlyGross.multiply(BigDecimal.valueOf(12));
        List<TaxSlab> slabs = taxSlabRepository.findByActiveTrueOrderByMinIncomeAsc();

        BigDecimal annualTax = BigDecimal.ZERO;
        BigDecimal remaining = annualIncome;

        for (TaxSlab slab : slabs) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal slabRange;
            if (slab.getMaxIncome() != null) {
                slabRange = slab.getMaxIncome().subtract(slab.getMinIncome()).add(BigDecimal.ONE);
            } else {
                slabRange = remaining;
            }

            BigDecimal taxable = remaining.min(slabRange);
            BigDecimal tax = taxable.multiply(slab.getRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            annualTax = annualTax.add(tax);
            remaining = remaining.subtract(taxable);
        }

        return annualTax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }

    private PayrollResponse mapToResponse(Payroll p) {
        return PayrollResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFullName())
                .employeeCode(p.getEmployee().getEmployeeId())
                .departmentName(p.getEmployee().getDepartment() != null
                        ? p.getEmployee().getDepartment().getName() : null)
                .designation(p.getEmployee().getDesignation())
                .month(p.getMonth())
                .year(p.getYear())
                .basicSalary(p.getBasicSalary())
                .hra(p.getHra())
                .da(p.getDa())
                .otherAllowances(p.getOtherAllowances())
                .grossSalary(p.getGrossSalary())
                .pfDeduction(p.getPfDeduction())
                .professionalTax(p.getProfessionalTax())
                .incomeTax(p.getIncomeTax())
                .otherDeductions(p.getOtherDeductions())
                .esiDeduction(p.getEsiDeduction())
                .totalDeductions(p.getTotalDeductions())
                .bonus(p.getBonus())
                .netSalary(p.getNetSalary())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .processedAt(p.getProcessedAt())
                .paidAt(p.getPaidAt())
                .build();
    }
}
