package com.nexushr.enterprise.planning.repository;

import com.nexushr.enterprise.planning.entity.SuccessionBench;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SuccessionBenchRepository extends JpaRepository<SuccessionBench, UUID> {
    List<SuccessionBench> findByRoleId(UUID roleId);
}
