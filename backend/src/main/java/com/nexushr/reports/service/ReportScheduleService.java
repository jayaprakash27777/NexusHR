package com.nexushr.reports.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexushr.reports.dto.ReportData;
import com.nexushr.reports.model.ReportHistory;
import com.nexushr.reports.model.ReportSchedule;
import com.nexushr.reports.repository.ReportHistoryRepository;
import com.nexushr.reports.repository.ReportScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportScheduleService {

    private final ReportScheduleRepository scheduleRepository;
    private final ReportHistoryRepository historyRepository;
    private final ReportDataService reportDataService;
    private final ReportExportService reportExportService;
    private final ObjectMapper objectMapper;

    @Scheduled(cron = "0 * * * * *") // Runs every minute
    @Transactional
    public void processSchedules() {
        log.info("Checking for pending report schedules...");
        List<ReportSchedule> activeSchedules = scheduleRepository.findByStatus("ACTIVE");
        LocalDateTime now = LocalDateTime.now();

        for (ReportSchedule schedule : activeSchedules) {
            if (schedule.getNextRun() == null || !now.isBefore(schedule.getNextRun())) {
                executeSchedule(schedule, now);
            }
        }
    }

    private void executeSchedule(ReportSchedule schedule, LocalDateTime now) {
        log.info("Executing report schedule: {}", schedule.getId());
        
        try {
            Map<String, Object> filters = null;
            if (schedule.getFiltersJson() != null) {
                filters = objectMapper.readValue(schedule.getFiltersJson(), new TypeReference<Map<String, Object>>() {});
            }

            // 1. Get Data
            ReportData data = reportDataService.getReportData(schedule.getReportType(), filters);

            // 2. Export
            String fileUrl = "";
            switch (schedule.getFormat().toUpperCase()) {
                case "CSV":
                    fileUrl = reportExportService.exportToCsv(data, schedule.getReportType());
                    break;
                case "EXCEL":
                    fileUrl = reportExportService.exportToExcel(data, schedule.getReportType());
                    break;
                case "PDF":
                    fileUrl = reportExportService.exportToPdf(data, schedule.getReportType());
                    break;
                default:
                    throw new IllegalArgumentException("Unknown format: " + schedule.getFormat());
            }

            // 3. Save History
            ReportHistory history = ReportHistory.builder()
                    .reportType(schedule.getReportType())
                    .generatedBy(schedule.getUser())
                    .fileUrl(fileUrl)
                    .format(schedule.getFormat())
                    .filtersJson(schedule.getFiltersJson())
                    .status("COMPLETED")
                    .build();
            historyRepository.save(history);

            // 4. Update Schedule
            schedule.setLastRun(now);
            CronExpression expression = CronExpression.parse(schedule.getCronExpression());
            schedule.setNextRun(expression.next(now));
            scheduleRepository.save(schedule);

            log.info("Successfully executed schedule: {}", schedule.getId());

        } catch (Exception e) {
            log.error("Failed to execute schedule: {}", schedule.getId(), e);
            ReportHistory history = ReportHistory.builder()
                    .reportType(schedule.getReportType())
                    .generatedBy(schedule.getUser())
                    .format(schedule.getFormat())
                    .filtersJson(schedule.getFiltersJson())
                    .status("FAILED")
                    .build();
            historyRepository.save(history);
        }
    }
}
