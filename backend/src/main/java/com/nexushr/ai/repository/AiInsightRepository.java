package com.nexushr.ai.repository;

import com.nexushr.ai.model.AiInsight;
import com.nexushr.ai.model.InsightPriority;
import com.nexushr.ai.model.InsightType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, UUID> {

    Page<AiInsight> findByDismissedFalseOrderByGeneratedAtDesc(Pageable pageable);

    List<AiInsight> findByInsightTypeAndDismissedFalseOrderByGeneratedAtDesc(InsightType type);

    List<AiInsight> findByPriorityAndDismissedFalseOrderByGeneratedAtDesc(InsightPriority priority);

    List<AiInsight> findByEmployeeIdAndDismissedFalseOrderByGeneratedAtDesc(UUID employeeId);

    List<AiInsight> findByDepartmentIdAndDismissedFalseOrderByGeneratedAtDesc(UUID departmentId);

    long countByDismissedFalse();

    long countByPriorityAndDismissedFalse(InsightPriority priority);
}
