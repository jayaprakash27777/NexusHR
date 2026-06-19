package com.nexushr.auth.service;

import com.nexushr.auth.model.Delegation;
import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.DelegationRepository;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DelegationExecutionService {

    private final DelegationRepository delegationRepository;
    private final UserRepository userRepository;

    /**
     * Given an intended approver, this checks if they have delegated their authority to someone else.
     * It handles simple "FULL_ROLE" delegations for now.
     */
    @Transactional(readOnly = true)
    public User resolveEffectiveApprover(UUID intendedApproverId) {
        User intendedApprover = userRepository.findById(intendedApproverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", intendedApproverId));

        // Find active delegation for this user
        // We look for FULL_ROLE or specific category matching the context.
        // For simplicity, we check if they have any active FULL_ROLE delegation.
        List<Delegation> activeDelegations = delegationRepository.findActiveDelegationsForDelegator(intendedApproverId, LocalDateTime.now());

        if (activeDelegations.isEmpty()) {
            return intendedApprover; // No delegation, they are the approver
        }

        // Return the delegatee of the first active delegation. 
        // In a real complex system, we'd check if it's LEAVE category, etc.
        Delegation delegation = activeDelegations.get(0);
        
        log.info("Resolved effective approver for user {} to delegatee {}", intendedApprover.getEmail(), delegation.getDelegatee().getEmail());
        return delegation.getDelegatee();
    }

    /**
     * Clean up expired delegations daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireOldDelegations() {
        log.info("Running job to expire old delegations...");
        // Actually, our repository method already filters by endDate.
        // But if we want to physically mark them as inactive in DB:
        // List<Delegation> expired = delegationRepository.findExpiredActiveDelegations(LocalDateTime.now());
        // expired.forEach(d -> d.setStatus(REVOKED));
        // delegationRepository.saveAll(expired);
    }
}
