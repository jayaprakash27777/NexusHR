package com.nexushr.attendance.dto;

import com.nexushr.attendance.model.AttendanceStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttendanceCorrectionRequest {
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private AttendanceStatus status;
    private String notes;
}
