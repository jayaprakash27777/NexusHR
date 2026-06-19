package com.nexushr.auth.repository;

import com.nexushr.auth.model.Delegation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DelegationRepository extends JpaRepository<Delegation, UUID> {
    List<Delegation> findByDelegatorId(UUID delegatorId);
    List<Delegation> findByDelegateeId(UUID delegateeId);

    @Query("SELECT d FROM Delegation d WHERE d.delegatee.id = :delegateeId AND d.status = 'FULL_ROLE' AND d.startDate <= :now AND d.endDate >= :now")
    List<Delegation> findActiveDelegationsForDelegatee(@Param("delegateeId") UUID delegateeId, @Param("now") LocalDateTime now);

    @Query("SELECT d FROM Delegation d WHERE d.delegator.id = :delegatorId AND d.status = 'FULL_ROLE' AND d.startDate <= :now AND d.endDate >= :now")
    List<Delegation> findActiveDelegationsForDelegator(@Param("delegatorId") UUID delegatorId, @Param("now") LocalDateTime now);
}
