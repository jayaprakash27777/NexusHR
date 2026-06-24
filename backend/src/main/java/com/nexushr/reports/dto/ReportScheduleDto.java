package com.nexushr.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportScheduleDto {
    private UUID id;
    private String reportType;
    private String cronExpression;
    private String format;
    private Map<String, Object> filters;
    private String status;
    private LocalDateTime lastRun;
    private LocalDateTime nextRun;
    private LocalDateTime createdAt;
}
