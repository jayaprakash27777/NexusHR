package com.nexushr.attendance.service;

import com.nexushr.attendance.dto.ShiftDto;
import com.nexushr.common.dto.ApiResponse;

import java.util.List;
import java.util.UUID;

public interface ShiftService {
    ApiResponse<List<ShiftDto>> getAllShifts();
    ApiResponse<ShiftDto> getShift(UUID id);
    ApiResponse<ShiftDto> createShift(ShiftDto shiftDto);
    ApiResponse<ShiftDto> updateShift(UUID id, ShiftDto shiftDto);
    ApiResponse<Void> deleteShift(UUID id);
    ApiResponse<Void> assignShiftToEmployee(UUID shiftId, UUID employeeId);
}
