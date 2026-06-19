package com.nexushr.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryResponse {

    private UUID employeeId;
    private String employeeName;
    private int year;
    private int month;
    private long totalWorkingDays;
    private long presentDays;
    private long absentDays;
    private long halfDays;
    private long leaveDays;
    private double attendancePercentage;
    private double averageWorkHours;
}
