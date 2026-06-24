package com.nexushr.auth.repository;

import com.nexushr.auth.model.LoginHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {
    Page<LoginHistory> findByUserId(UUID userId, Pageable pageable);
    
    long countByStatus(String status);
}
