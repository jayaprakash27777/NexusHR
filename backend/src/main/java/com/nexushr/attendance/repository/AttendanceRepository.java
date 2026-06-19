package com.nexushr.attendance.repository;

import com.nexushr.attendance.model.Attendance;
import com.nexushr.attendance.model.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    Optional<Attendance> findByEmployeeIdAndDate(UUID employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetweenOrderByDateDesc(UUID employeeId, LocalDate startDate, LocalDate endDate);

    Page<Attendance> findByEmployeeIdOrderByDateDesc(UUID employeeId, Pageable pageable);

    List<Attendance> findByDateOrderByEmployeeFirstNameAsc(LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :empId AND a.date BETWEEN :start AND :end AND a.status = :status")
    long countByEmployeeAndDateRangeAndStatus(
            @Param("empId") UUID employeeId,
            @Param("start") LocalDate startDate,
            @Param("end") LocalDate endDate,
            @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :empId AND a.date BETWEEN :start AND :end")
    long countByEmployeeAndDateRange(
            @Param("empId") UUID employeeId,
            @Param("start") LocalDate startDate,
            @Param("end") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status")
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(DISTINCT a.employee.id) FROM Attendance a WHERE a.date = :date")
    long countDistinctEmployeesByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(AVG(a.workHours), 0) FROM Attendance a WHERE a.employee.id = :empId AND a.date BETWEEN :start AND :end")
    double avgWorkHoursByEmployeeAndDateRange(
            @Param("empId") UUID employeeId,
            @Param("start") LocalDate startDate,
            @Param("end") LocalDate endDate);

    boolean existsByEmployeeIdAndDate(UUID employeeId, LocalDate date);
}
