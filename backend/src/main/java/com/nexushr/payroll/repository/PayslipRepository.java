package com.nexushr.payroll.repository;

import com.nexushr.payroll.model.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID> {

    Optional<Payslip> findByPayrollId(UUID payrollId);

    List<Payslip> findByEmployeeIdOrderByYearDescMonthDesc(UUID employeeId);

    Optional<Payslip> findByEmployeeIdAndMonthAndYear(UUID employeeId, int month, int year);

    boolean existsByPayrollId(UUID payrollId);
}
