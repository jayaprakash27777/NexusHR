package com.nexushr.enterprise.planning.service;

import com.nexushr.enterprise.planning.dto.CompensationCycleDto;
import com.nexushr.enterprise.planning.dto.CompensationProposalDto;
import com.nexushr.enterprise.planning.entity.CompensationCycle;
import com.nexushr.enterprise.planning.entity.CompensationProposal;
import com.nexushr.enterprise.planning.repository.CompensationCycleRepository;
import com.nexushr.enterprise.planning.repository.CompensationProposalRepository;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompensationService {

    private final CompensationCycleRepository cycleRepository;
    private final CompensationProposalRepository proposalRepository;

    public List<CompensationCycleDto> getAllCycles() {
        return cycleRepository.findAll().stream().map(this::mapToCycleDto).collect(Collectors.toList());
    }

    public CompensationCycleDto getCycleById(UUID id) {
        return cycleRepository.findById(id)
                .map(this::mapToCycleDto)
                .orElseThrow(() -> new ResourceNotFoundException("CompensationCycle", "id", id));
    }

    public List<CompensationProposalDto> getProposalsByCycle(UUID cycleId) {
        return proposalRepository.findByCycleId(cycleId).stream().map(this::mapToProposalDto).collect(Collectors.toList());
    }

    @Transactional
    public CompensationProposalDto updateProposal(UUID id, CompensationProposalDto dto) {
        CompensationProposal proposal = proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CompensationProposal", "id", id));

        proposal.setProposedIncrease(dto.getProposedIncrease());
        proposal.setProposedBonus(dto.getProposedBonus());
        proposal.setJustification(dto.getJustification());
        
        return mapToProposalDto(proposalRepository.save(proposal));
    }

    private CompensationCycleDto mapToCycleDto(CompensationCycle cycle) {
        CompensationCycleDto dto = new CompensationCycleDto();
        dto.setId(cycle.getId());
        dto.setName(cycle.getName());
        dto.setFiscalYear(cycle.getFiscalYear());
        dto.setTotalBudget(cycle.getTotalBudget());
        dto.setStatus(cycle.getStatus());
        return dto;
    }

    private CompensationProposalDto mapToProposalDto(CompensationProposal prop) {
        CompensationProposalDto dto = new CompensationProposalDto();
        dto.setId(prop.getId());
        dto.setCycleId(prop.getCycle().getId());
        dto.setEmployeeId(prop.getEmployee().getId());
        dto.setEmployeeName(prop.getEmployee().getFirstName() + " " + prop.getEmployee().getLastName());
        dto.setCurrentSalary(prop.getCurrentSalary());
        dto.setProposedIncrease(prop.getProposedIncrease());
        dto.setProposedBonus(prop.getProposedBonus());
        dto.setPerformanceScore(prop.getPerformanceScore());
        dto.setCompaRatio(prop.getCompaRatio());
        dto.setJustification(prop.getJustification());
        return dto;
    }
}
