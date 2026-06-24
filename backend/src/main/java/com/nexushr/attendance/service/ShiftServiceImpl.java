package com.nexushr.attendance.service;

import com.nexushr.attendance.dto.ShiftDto;
import com.nexushr.attendance.model.Shift;
import com.nexushr.attendance.repository.ShiftRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ShiftDto>> getAllShifts() {
        List<ShiftDto> shifts = shiftRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
        return ApiResponse.success(shifts);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ShiftDto> getShift(UUID id) {
        Shift shift = shiftRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));
        return ApiResponse.success(mapToDto(shift));
    }

    @Override
    @Transactional
    public ApiResponse<ShiftDto> createShift(ShiftDto shiftDto) {
        Shift shift = Shift.builder()
                .name(shiftDto.getName())
                .startTime(shiftDto.getStartTime())
                .endTime(shiftDto.getEndTime())
                .description(shiftDto.getDescription())
                .build();
        Shift saved = shiftRepository.save(shift);
        return ApiResponse.success("Shift created", mapToDto(saved));
    }

    @Override
    @Transactional
    public ApiResponse<ShiftDto> updateShift(UUID id, ShiftDto shiftDto) {
        Shift shift = shiftRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));
        if (shiftDto.getName() != null) shift.setName(shiftDto.getName());
        if (shiftDto.getStartTime() != null) shift.setStartTime(shiftDto.getStartTime());
        if (shiftDto.getEndTime() != null) shift.setEndTime(shiftDto.getEndTime());
        if (shiftDto.getDescription() != null) shift.setDescription(shiftDto.getDescription());
        Shift saved = shiftRepository.save(shift);
        return ApiResponse.success("Shift updated", mapToDto(saved));
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteShift(UUID id) {
        Shift shift = shiftRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));
        shiftRepository.delete(shift);
        return ApiResponse.success("Shift deleted");
    }

    @Override
    @Transactional
    public ApiResponse<Void> assignShiftToEmployee(UUID shiftId, UUID employeeId) {
        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        employee.setShift(shift);
        employeeRepository.save(employee);
        return ApiResponse.success("Shift assigned to employee");
    }

    private ShiftDto mapToDto(Shift shift) {
        return ShiftDto.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .description(shift.getDescription())
                .build();
    }
}
