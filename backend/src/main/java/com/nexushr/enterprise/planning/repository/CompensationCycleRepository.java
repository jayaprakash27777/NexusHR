package com.nexushr.enterprise.planning.repository;

import com.nexushr.enterprise.planning.entity.CompensationCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CompensationCycleRepository extends JpaRepository<CompensationCycle, UUID> {
}
