package com.nexushr.employee.repository;

import com.nexushr.employee.model.EmploymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmploymentHistoryRepository extends JpaRepository<EmploymentHistory, UUID> {
    List<EmploymentHistory> findByEmployeeIdOrderByEffectiveDateDesc(UUID employeeId);
}
