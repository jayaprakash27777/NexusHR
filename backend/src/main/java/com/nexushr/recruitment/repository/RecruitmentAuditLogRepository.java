package com.nexushr.recruitment.repository;

import com.nexushr.recruitment.model.RecruitmentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecruitmentAuditLogRepository extends JpaRepository<RecruitmentAuditLog, UUID> {
    List<RecruitmentAuditLog> findByEntityIdOrderByTimestampDesc(UUID entityId);
    List<RecruitmentAuditLog> findAllByOrderByTimestampDesc();
}
