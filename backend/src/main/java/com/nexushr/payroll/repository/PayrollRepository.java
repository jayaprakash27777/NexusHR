package com.nexushr.payroll.repository;

import com.nexushr.payroll.model.Payroll;
import com.nexushr.payroll.model.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, UUID> {

    Optional<Payroll> findByEmployeeIdAndMonthAndYear(UUID employeeId, int month, int year);

    List<Payroll> findByMonthAndYearOrderByEmployeeFirstNameAsc(int month, int year);

    List<Payroll> findByMonthAndYearAndStatus(int month, int year, PayrollStatus status);

    @Query("SELECT p FROM Payroll p JOIN p.employee e LEFT JOIN e.department d " +
           "WHERE p.month = :month AND p.year = :year " +
           "AND (:department IS NULL OR :department = '' OR d.name = :department) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Payroll> searchMonthlyPayroll(@Param("month") int month, 
                                       @Param("year") int year, 
                                       @Param("search") String search, 
                                       @Param("department") String department, 
                                       Pageable pageable);

    Page<Payroll> findByEmployeeIdOrderByYearDescMonthDesc(UUID employeeId, Pageable pageable);

    boolean existsByEmployeeIdAndMonthAndYear(UUID employeeId, int month, int year);

    @Query("SELECT COUNT(p) FROM Payroll p WHERE p.month = :month AND p.year = :year AND p.status = :status")
    long countByMonthYearAndStatus(@Param("month") int month, @Param("year") int year, @Param("status") PayrollStatus status);

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM Payroll p WHERE p.month = :month AND p.year = :year")
    java.math.BigDecimal totalPayrollForMonth(@Param("month") int month, @Param("year") int year);

    interface DepartmentCostProjection {
        String getDepartment();
        java.math.BigDecimal getCost();
    }

    interface MonthlyCostProjection {
        int getMonth();
        int getYear();
        java.math.BigDecimal getCost();
    }

    @Query("SELECT COALESCE(e.department.name, 'Unassigned') AS department, SUM(p.netSalary) AS cost " +
           "FROM Payroll p JOIN p.employee e " +
           "WHERE p.month = :month AND p.year = :year " +
           "GROUP BY e.department.name")
    List<DepartmentCostProjection> getDepartmentCosts(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT month, year, SUM(net_salary) AS cost " +
                   "FROM payroll " +
                   "GROUP BY year, month " +
                   "ORDER BY year DESC, month DESC " +
                   "LIMIT 6", nativeQuery = true)
    List<MonthlyCostProjection> getMonthlyCosts();
}
