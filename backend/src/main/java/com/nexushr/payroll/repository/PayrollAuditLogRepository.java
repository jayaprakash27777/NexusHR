package com.nexushr.payroll.repository;

import com.nexushr.payroll.model.PayrollAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollAuditLogRepository extends JpaRepository<PayrollAuditLog, UUID> {
    List<PayrollAuditLog> findByMonthAndYearOrderByTimestampDesc(int month, int year);
}
