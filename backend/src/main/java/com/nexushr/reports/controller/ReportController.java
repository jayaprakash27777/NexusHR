package com.nexushr.reports.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.reports.dto.ReportData;
import com.nexushr.reports.dto.ReportHistoryDto;
import com.nexushr.reports.dto.ReportRequest;
import com.nexushr.reports.dto.ReportScheduleDto;
import com.nexushr.reports.model.ReportHistory;
import com.nexushr.reports.model.ReportSchedule;
import com.nexushr.reports.repository.ReportHistoryRepository;
import com.nexushr.reports.repository.ReportScheduleRepository;
import com.nexushr.reports.service.ReportDataService;
import com.nexushr.reports.service.ReportExportService;
import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reports")
@Tag(name = "Reports", description = "System reports and data exports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportDataService reportDataService;
    private final ReportExportService reportExportService;
    private final ReportHistoryRepository historyRepository;
    private final ReportScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'FINANCE')")
    @Operation(summary = "Generate a new report immediately")
    public ResponseEntity<ApiResponse<ReportHistoryDto>> generateReport(@RequestBody ReportRequest request) throws JsonProcessingException {
        User user = getCurrentUser();

        // 1. Get Data
        ReportData data = reportDataService.getReportData(request.getReportType(), request.getFilters());

        // 2. Export
        String fileUrl = "";
        switch (request.getFormat().toUpperCase()) {
            case "CSV":
                fileUrl = reportExportService.exportToCsv(data, request.getReportType());
                break;
            case "EXCEL":
                fileUrl = reportExportService.exportToExcel(data, request.getReportType());
                break;
            case "PDF":
                fileUrl = reportExportService.exportToPdf(data, request.getReportType());
                break;
            default:
                throw new IllegalArgumentException("Unknown format: " + request.getFormat());
        }

        // 3. Save History
        ReportHistory history = ReportHistory.builder()
                .reportType(request.getReportType())
                .generatedBy(user)
                .fileUrl(fileUrl)
                .format(request.getFormat())
                .filtersJson(request.getFilters() != null ? objectMapper.writeValueAsString(request.getFilters()) : null)
                .status("COMPLETED")
                .build();
        historyRepository.save(history);

        return ResponseEntity.ok(ApiResponse.success(mapToHistoryDto(history)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'FINANCE')")
    @Operation(summary = "Get report generation history")
    public ResponseEntity<ApiResponse<List<ReportHistoryDto>>> getReportHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        User user = getCurrentUser();
        Page<ReportHistory> historyPage = historyRepository.findByGeneratedByIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));
        
        List<ReportHistoryDto> dtoList = historyPage.getContent().stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtoList));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'FINANCE')")
    @Operation(summary = "Create a recurring report schedule")
    public ResponseEntity<ApiResponse<ReportScheduleDto>> createSchedule(@RequestBody ReportScheduleDto request) throws JsonProcessingException {
        User user = getCurrentUser();

        CronExpression expression = CronExpression.parse(request.getCronExpression());
        LocalDateTime nextRun = expression.next(LocalDateTime.now());

        ReportSchedule schedule = ReportSchedule.builder()
                .reportType(request.getReportType())
                .user(user)
                .cronExpression(request.getCronExpression())
                .format(request.getFormat())
                .filtersJson(request.getFilters() != null ? objectMapper.writeValueAsString(request.getFilters()) : null)
                .status("ACTIVE")
                .nextRun(nextRun)
                .build();

        scheduleRepository.save(schedule);

        return ResponseEntity.ok(ApiResponse.success(mapToScheduleDto(schedule)));
    }

    @GetMapping("/schedules")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'FINANCE')")
    @Operation(summary = "Get active report schedules")
    public ResponseEntity<ApiResponse<List<ReportScheduleDto>>> getSchedules() {
        User user = getCurrentUser();
        List<ReportSchedule> schedules = scheduleRepository.findByUserId(user.getId());
        
        List<ReportScheduleDto> dtoList = schedules.stream()
                .map(this::mapToScheduleDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtoList));
    }

    @DeleteMapping("/schedules/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'FINANCE')")
    @Operation(summary = "Delete a report schedule")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable UUID id) {
        scheduleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ReportHistoryDto mapToHistoryDto(ReportHistory history) {
        Map<String, Object> filters = null;
        try {
            if (history.getFiltersJson() != null) {
                filters = objectMapper.readValue(history.getFiltersJson(), Map.class);
            }
        } catch (Exception ignored) {}

        return ReportHistoryDto.builder()
                .id(history.getId())
                .reportType(history.getReportType())
                .generatedByName(history.getGeneratedBy() != null ? history.getGeneratedBy().getFirstName() + " " + history.getGeneratedBy().getLastName() : "System")
                .fileUrl(history.getFileUrl())
                .format(history.getFormat())
                .filters(filters)
                .status(history.getStatus())
                .createdAt(history.getCreatedAt())
                .build();
    }

    private ReportScheduleDto mapToScheduleDto(ReportSchedule schedule) {
        Map<String, Object> filters = null;
        try {
            if (schedule.getFiltersJson() != null) {
                filters = objectMapper.readValue(schedule.getFiltersJson(), Map.class);
            }
        } catch (Exception ignored) {}

        return ReportScheduleDto.builder()
                .id(schedule.getId())
                .reportType(schedule.getReportType())
                .cronExpression(schedule.getCronExpression())
                .format(schedule.getFormat())
                .filters(filters)
                .status(schedule.getStatus())
                .lastRun(schedule.getLastRun())
                .nextRun(schedule.getNextRun())
                .createdAt(schedule.getCreatedAt())
                .build();
    }
}
