package com.nexushr.payroll.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.payroll.dto.PayrollProcessRequest;
import com.nexushr.payroll.dto.PayrollResponse;
import com.nexushr.payroll.dto.PayrollSummaryResponse;
import com.nexushr.payroll.model.Payroll;
import com.nexushr.payroll.model.Payslip;
import com.nexushr.payroll.repository.PayrollRepository;
import com.nexushr.payroll.repository.PayslipRepository;
import com.nexushr.payroll.service.PayrollService;
import com.nexushr.payroll.service.PdfPayslipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll processing and payslip management")
public class PayrollController {

    private final PayrollService payrollService;
    private final PdfPayslipService pdfPayslipService;
    private final PayrollRepository payrollRepository;
    private final PayslipRepository payslipRepository;
    private final com.nexushr.payroll.service.PayrollReportService payrollReportService;

    @PostMapping("/process")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Process payroll", description = "Process payroll for a single employee (Admin only)")
    public ResponseEntity<ApiResponse<PayrollResponse>> processPayroll(
            @Valid @RequestBody PayrollProcessRequest request) {
        return ResponseEntity.ok(payrollService.processPayroll(request));
    }

    @PostMapping("/batch/{month}/{year}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Batch process payroll for all active employees")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> batchProcessPayroll(
            @PathVariable int month, @PathVariable int year) {
        return ResponseEntity.ok(payrollService.batchProcessPayroll(month, year));
    }

    @PostMapping("/batch/{month}/{year}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve all PROCESSED payrolls for the month")
    public ResponseEntity<ApiResponse<String>> approveMonthlyPayroll(
            @PathVariable int month, @PathVariable int year) {
        return ResponseEntity.ok(payrollService.approveMonthlyPayroll(month, year));
    }

    @PostMapping("/batch/{month}/{year}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lock all APPROVED payrolls for the month")
    public ResponseEntity<ApiResponse<String>> lockMonthlyPayroll(
            @PathVariable int month, @PathVariable int year) {
        return ResponseEntity.ok(payrollService.lockMonthlyPayroll(month, year));
    }

    @PostMapping("/batch/{month}/{year}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unlock all LOCKED payrolls for the month")
    public ResponseEntity<ApiResponse<String>> unlockMonthlyPayroll(
            @PathVariable int month, @PathVariable int year) {
        return ResponseEntity.ok(payrollService.unlockMonthlyPayroll(month, year));
    }

    @GetMapping("/audit/{month}/{year}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs for a specific payroll month")
    public ResponseEntity<ApiResponse<List<com.nexushr.payroll.dto.PayrollAuditLogResponse>>> getAuditLogs(
            @PathVariable int month, @PathVariable int year) {
        return ResponseEntity.ok(payrollService.getAuditLogs(month, year));
    }

    @PostMapping("/{payrollId}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark as paid", description = "Mark payroll as paid (Admin only)")
    public ResponseEntity<ApiResponse<PayrollResponse>> markAsPaid(@PathVariable UUID payrollId) {
        return ResponseEntity.ok(payrollService.markAsPaid(payrollId));
    }

    @GetMapping("/{payrollId}")
    @Operation(summary = "Get payroll by ID")
    public ResponseEntity<ApiResponse<PayrollResponse>> getById(@PathVariable UUID payrollId) {
        return ResponseEntity.ok(payrollService.getById(payrollId));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get employee payroll", description = "Get payroll for a specific employee and month")
    public ResponseEntity<ApiResponse<PayrollResponse>> getByEmployeeAndMonth(
            @PathVariable UUID employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getByEmployeeAndMonth(employeeId, month, year));
    }

    @GetMapping("/employee/{employeeId}/history")
    @Operation(summary = "Payroll history", description = "Get paginated payroll history for an employee")
    public ResponseEntity<PagedResponse<PayrollResponse>> getHistory(
            @PathVariable UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(payrollService.getEmployeePayrollHistory(employeeId, page, size));
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Monthly payroll report", description = "Get all payrolls for a month (Admin only)")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getMonthlyPayroll(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getMonthlyPayroll(month, year));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search monthly payroll", description = "Paginated search with filters for a month (Admin only)")
    public ResponseEntity<PagedResponse<PayrollResponse>> searchMonthlyPayroll(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "employeeName") String sort,
            @RequestParam(defaultValue = "asc") String dir) {
        return ResponseEntity.ok(payrollService.searchMonthlyPayroll(month, year, search, department, page, size, sort, dir));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Monthly payroll summary", description = "Aggregate payroll statistics (Admin only)")
    public ResponseEntity<ApiResponse<PayrollSummaryResponse>> getMonthlySummary(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getMonthlyPayrollSummary(month, year));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get payroll analytics", description = "Get charts data for analytics tab")
    public ResponseEntity<ApiResponse<com.nexushr.payroll.dto.PayrollAnalyticsResponse>> getAnalytics(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getAnalytics(month, year));
    }

    @GetMapping("/reports/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export monthly payroll report")
    public ResponseEntity<byte[]> exportMonthlyReport(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam String format) {
        
        byte[] data;
        String contentType;
        String fileName;
        
        String monthName = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        
        switch (format.toLowerCase()) {
            case "csv":
                data = payrollReportService.generateCsvReport(month, year);
                contentType = "text/csv";
                fileName = "Payroll_Report_" + monthName + "_" + year + ".csv";
                break;
            case "excel":
                data = payrollReportService.generateExcelReport(month, year);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = "Payroll_Report_" + monthName + "_" + year + ".xlsx";
                break;
            case "pdf":
                data = payrollReportService.generatePdfReport(month, year);
                contentType = MediaType.APPLICATION_PDF_VALUE;
                fileName = "Payroll_Report_" + monthName + "_" + year + ".pdf";
                break;
            default:
                throw new IllegalArgumentException("Unsupported format: " + format);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        headers.setContentLength(data.length);

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @GetMapping("/{payrollId}/payslip/download")
    @Operation(summary = "Download payslip PDF", description = "Generate and download payslip as PDF")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable UUID payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));

        byte[] pdfBytes = pdfPayslipService.generatePayslip(payroll);

        String monthName = Month.of(payroll.getMonth()).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        String fileName = String.format("Payslip_%s_%s_%d.pdf",
                payroll.getEmployee().getEmployeeId(), monthName, payroll.getYear());

        // Save payslip metadata
        if (!payslipRepository.existsByPayrollId(payrollId)) {
            Payslip payslip = Payslip.builder()
                    .payroll(payroll)
                    .employee(payroll.getEmployee())
                    .month(payroll.getMonth())
                    .year(payroll.getYear())
                    .fileName(fileName)
                    .generatedAt(LocalDateTime.now())
                    .build();
            payslipRepository.save(payslip);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName).build());
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
