package com.nexushr.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PayrollAuditLogResponse {
    private UUID id;
    private int month;
    private int year;
    private String action;
    private String actionBy;
    private String details;
    private LocalDateTime timestamp;
}
