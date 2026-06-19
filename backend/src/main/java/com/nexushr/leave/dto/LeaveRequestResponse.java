package com.nexushr.leave.dto;

import com.nexushr.leave.model.LeaveStatus;
import com.nexushr.leave.model.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private LeaveStatus status;
    private UUID approvedById;
    private String approvedByName;
    private String reviewerRemarks;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
}
