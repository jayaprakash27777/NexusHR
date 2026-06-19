package com.nexushr.auth.repository;

import com.nexushr.auth.model.Permission;
import com.nexushr.auth.model.enums.PermissionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    Optional<Permission> findByCategoryAndAction(PermissionCategory category, String action);
    org.springframework.data.domain.Page<Permission> findByCategory(PermissionCategory category, org.springframework.data.domain.Pageable pageable);
}
