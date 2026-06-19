package com.nexushr.auth.repository;

import com.nexushr.auth.model.Role;
import com.nexushr.auth.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    @Query("SELECT r FROM Role r WHERE r.parentRole.id = :parentId")
    List<Role> findChildrenByParentId(@Param("parentId") Long parentId);

    org.springframework.data.domain.Page<Role> findByTenantId(UUID tenantId, org.springframework.data.domain.Pageable pageable);
}
