package com.nexushr.enterprise.planning.repository;

import com.nexushr.enterprise.planning.entity.CompensationProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompensationProposalRepository extends JpaRepository<CompensationProposal, UUID> {
    List<CompensationProposal> findByCycleId(UUID cycleId);
}
