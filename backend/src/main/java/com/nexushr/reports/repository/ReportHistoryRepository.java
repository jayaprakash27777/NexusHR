package com.nexushr.reports.repository;

import com.nexushr.reports.model.ReportHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, UUID> {
    Page<ReportHistory> findByGeneratedByIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
