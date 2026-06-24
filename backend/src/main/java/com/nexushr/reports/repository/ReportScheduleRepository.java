package com.nexushr.reports.repository;

import com.nexushr.reports.model.ReportSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportScheduleRepository extends JpaRepository<ReportSchedule, UUID> {
    List<ReportSchedule> findByStatus(String status);
    List<ReportSchedule> findByUserId(UUID userId);
}
