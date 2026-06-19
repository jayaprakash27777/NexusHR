package com.nexushr.leave.repository;

import com.nexushr.leave.model.LeaveRequest;
import com.nexushr.leave.model.LeaveStatus;
import com.nexushr.leave.model.LeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {

    Page<LeaveRequest> findByEmployeeIdOrderByAppliedAtDesc(UUID employeeId, Pageable pageable);

    Page<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveStatus status, Pageable pageable);

    List<LeaveRequest> findByEmployeeIdAndStatus(UUID employeeId, LeaveStatus status);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.manager.id = :managerId AND lr.status = :status ORDER BY lr.appliedAt DESC")
    Page<LeaveRequest> findByManagerAndStatus(
            @Param("managerId") UUID managerId,
            @Param("status") LeaveStatus status,
            Pageable pageable);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.manager.id = :managerId ORDER BY lr.appliedAt DESC")
    Page<LeaveRequest> findByManager(@Param("managerId") UUID managerId, Pageable pageable);

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.employee.manager.id = :managerId AND lr.status = 'PENDING'")
    long countPendingByManager(@Param("managerId") UUID managerId);

    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = 'PENDING'")
    long countAllPending();

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :empId AND lr.status != 'CANCELLED' " +
           "AND ((lr.startDate BETWEEN :start AND :end) OR (lr.endDate BETWEEN :start AND :end) " +
           "OR (lr.startDate <= :start AND lr.endDate >= :end))")
    List<LeaveRequest> findOverlappingLeaves(
            @Param("empId") UUID employeeId,
            @Param("start") LocalDate startDate,
            @Param("end") LocalDate endDate);

    long countByEmployeeIdAndLeaveTypeAndStatusAndStartDateBetween(
            UUID employeeId, LeaveType leaveType, LeaveStatus status,
            LocalDate startDate, LocalDate endDate);
}
