package com.nexushr.leave.repository;

import com.nexushr.leave.model.LeaveBalance;
import com.nexushr.leave.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndYear(UUID employeeId, LeaveType leaveType, int year);

    List<LeaveBalance> findByEmployeeIdAndYear(UUID employeeId, int year);

    List<LeaveBalance> findByEmployeeId(UUID employeeId);

    boolean existsByEmployeeIdAndLeaveTypeAndYear(UUID employeeId, LeaveType leaveType, int year);
}
