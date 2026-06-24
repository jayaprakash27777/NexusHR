package com.nexushr.leave.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.leave.dto.*;
import com.nexushr.leave.model.*;
import com.nexushr.leave.repository.LeaveBalanceRepository;
import com.nexushr.leave.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public ApiResponse<LeaveRequestResponse> applyLeave(UUID employeeId, LeaveApplyRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot apply leave for past dates");
        }

        // Calculate business days
        BigDecimal totalDays = calculateBusinessDays(request.getStartDate(), request.getEndDate());
        if (totalDays.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Leave period must include at least one working day");
        }

        // Check for overlapping leaves
        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingLeaves(
                employeeId, request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new BadRequestException("You already have a leave request for the selected dates");
        }

        // Check leave balance
        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(employeeId, request.getLeaveType(), year)
                .orElseThrow(() -> new BadRequestException(
                        "No leave balance found for " + request.getLeaveType() + " in " + year));

        if (!balance.hasEnoughBalance(totalDays)) {
            throw new BadRequestException(
                    "Insufficient leave balance. Available: " + balance.getRemainingDays() +
                    " days, Requested: " + totalDays + " days");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave applied: {} ({} days of {}) by {}",
                saved.getId(), totalDays, request.getLeaveType(), employee.getEmployeeId());

        return ApiResponse.success("Leave application submitted successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<LeaveRequestResponse> approveLeave(UUID leaveId, UUID approverId, LeaveActionRequest request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already " + leaveRequest.getStatus());
        }

        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", approverId));

        // Deduct from balance
        int year = leaveRequest.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeAndYear(
                        leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType(), year)
                .orElseThrow(() -> new BadRequestException("Leave balance not found"));

        balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getTotalDays()));
        leaveBalanceRepository.save(balance);

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setReviewedAt(LocalDateTime.now());
        if (request != null && request.getRemarks() != null) {
            leaveRequest.setReviewerRemarks(request.getRemarks());
        }

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave approved: {} by {}", leaveId, approver.getEmployeeId());

        return ApiResponse.success("Leave approved successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<LeaveRequestResponse> rejectLeave(UUID leaveId, UUID approverId, LeaveActionRequest request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Leave request is already " + leaveRequest.getStatus());
        }

        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", approverId));

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        leaveRequest.setApprovedBy(approver);
        leaveRequest.setReviewedAt(LocalDateTime.now());
        if (request != null && request.getRemarks() != null) {
            leaveRequest.setReviewerRemarks(request.getRemarks());
        }

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave rejected: {} by {}", leaveId, approver.getEmployeeId());

        return ApiResponse.success("Leave rejected", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<LeaveRequestResponse> cancelLeave(UUID leaveId, UUID employeeId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        if (!leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }
        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new BadRequestException("Leave is already cancelled");
        }

        // If was approved, restore balance
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            int year = leaveRequest.getStartDate().getYear();
            leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(
                            employeeId, leaveRequest.getLeaveType(), year)
                    .ifPresent(balance -> {
                        balance.setUsedDays(balance.getUsedDays().subtract(leaveRequest.getTotalDays()));
                        leaveBalanceRepository.save(balance);
                    });
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequest.setReviewedAt(LocalDateTime.now());
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

        log.info("Leave cancelled: {} by {}", leaveId, employeeId);
        return ApiResponse.success("Leave cancelled successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<LeaveBalanceResponse> grantCompOff(UUID employeeId, int days) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        int currentYear = java.time.LocalDate.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(employeeId, LeaveType.COMPENSATORY_OFF, currentYear)
                .orElseGet(() -> {
                    LeaveBalance newBalance = LeaveBalance.builder()
                            .employee(employee)
                            .year(currentYear)
                            .leaveType(LeaveType.COMPENSATORY_OFF)
                            .totalDays(java.math.BigDecimal.ZERO)
                            .usedDays(java.math.BigDecimal.ZERO)
                            .build();
                    return newBalance;
                });

        balance.setTotalDays(balance.getTotalDays().add(java.math.BigDecimal.valueOf(days)));
        LeaveBalance saved = leaveBalanceRepository.save(balance);

        LeaveBalanceResponse response = LeaveBalanceResponse.builder()
                .id(saved.getId())
                .employeeId(employeeId)
                .employeeName(employee.getFullName())
                .leaveType(saved.getLeaveType())
                .year(saved.getYear())
                .totalDays(saved.getTotalDays())
                .usedDays(saved.getUsedDays())
                .remainingDays(saved.getRemainingDays())
                .build();

        return ApiResponse.success("Compensatory off granted successfully", response);
    }

    @Override
    @Transactional
    public ApiResponse<Void> carryForwardLeaves(int year) {
        // Carry forward up to 5 days of EARNED_LEAVE from the specified year to year + 1
        List<LeaveBalance> balances = leaveBalanceRepository.findAll().stream()
                .filter(b -> b.getYear() == year && b.getLeaveType() == LeaveType.EARNED_LEAVE && b.getRemainingDays().compareTo(java.math.BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        for (LeaveBalance oldBalance : balances) {
            java.math.BigDecimal carryForwardDays = oldBalance.getRemainingDays().min(java.math.BigDecimal.valueOf(5));
            if (carryForwardDays.compareTo(java.math.BigDecimal.ZERO) > 0) {
                LeaveBalance newBalance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(oldBalance.getEmployee().getId(), LeaveType.EARNED_LEAVE, year + 1)
                        .orElseGet(() -> LeaveBalance.builder()
                                .employee(oldBalance.getEmployee())
                                .year(year + 1)
                                .leaveType(LeaveType.EARNED_LEAVE)
                                .totalDays(java.math.BigDecimal.ZERO)
                                .usedDays(java.math.BigDecimal.ZERO)
                                .build());
                
                newBalance.setTotalDays(newBalance.getTotalDays().add(carryForwardDays));
                leaveBalanceRepository.save(newBalance);
            }
        }
        return ApiResponse.success("Leaves carried forward successfully for " + balances.size() + " employees.");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<LeaveRequestResponse> getById(UUID leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));
        return ApiResponse.success(mapToResponse(leaveRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveRequestResponse> getByEmployee(UUID employeeId, int page, int size) {
        Page<LeaveRequest> requestPage = leaveRequestRepository
                .findByEmployeeIdOrderByAppliedAtDesc(employeeId, PageRequest.of(page, size));
        return buildPagedResponse(requestPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveRequestResponse> getPendingForManager(UUID managerId, int page, int size) {
        Page<LeaveRequest> requestPage = leaveRequestRepository
                .findByManagerAndStatus(managerId, LeaveStatus.PENDING, PageRequest.of(page, size));
        return buildPagedResponse(requestPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveRequestResponse> getByStatus(LeaveStatus status, int page, int size) {
        Page<LeaveRequest> requestPage = leaveRequestRepository
                .findByStatusOrderByAppliedAtDesc(status, PageRequest.of(page, size));
        return buildPagedResponse(requestPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveRequestResponse> getAllForManager(UUID managerId, int page, int size) {
        Page<LeaveRequest> requestPage = leaveRequestRepository
                .findByManager(managerId, PageRequest.of(page, size));
        return buildPagedResponse(requestPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<LeaveBalanceResponse>> getLeaveBalances(UUID employeeId, int year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        List<LeaveBalanceResponse> balances = leaveBalanceRepository
                .findByEmployeeIdAndYear(employeeId, year)
                .stream()
                .map(b -> LeaveBalanceResponse.builder()
                        .id(b.getId())
                        .employeeId(employeeId)
                        .employeeName(employee.getFullName())
                        .leaveType(b.getLeaveType())
                        .year(b.getYear())
                        .totalDays(b.getTotalDays())
                        .usedDays(b.getUsedDays())
                        .remainingDays(b.getRemainingDays())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.success(balances);
    }

    private BigDecimal calculateBusinessDays(LocalDate start, LocalDate end) {
        long days = 0;
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                days++;
            }
        }
        return BigDecimal.valueOf(days);
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest lr) {
        return LeaveRequestResponse.builder()
                .id(lr.getId())
                .employeeId(lr.getEmployee().getId())
                .employeeName(lr.getEmployee().getFullName())
                .employeeCode(lr.getEmployee().getEmployeeId())
                .departmentName(lr.getEmployee().getDepartment() != null
                        ? lr.getEmployee().getDepartment().getName() : null)
                .leaveType(lr.getLeaveType())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .totalDays(lr.getTotalDays())
                .reason(lr.getReason())
                .status(lr.getStatus())
                .approvedById(lr.getApprovedBy() != null ? lr.getApprovedBy().getId() : null)
                .approvedByName(lr.getApprovedBy() != null ? lr.getApprovedBy().getFullName() : null)
                .reviewerRemarks(lr.getReviewerRemarks())
                .appliedAt(lr.getAppliedAt())
                .reviewedAt(lr.getReviewedAt())
                .build();
    }

    private PagedResponse<LeaveRequestResponse> buildPagedResponse(Page<LeaveRequest> page) {
        List<LeaveRequestResponse> content = page.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());

        return PagedResponse.<LeaveRequestResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
