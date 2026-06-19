package com.nexushr.enterprise.planning.repository;

import com.nexushr.enterprise.planning.entity.SuccessionRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SuccessionRoleRepository extends JpaRepository<SuccessionRole, UUID> {
}
