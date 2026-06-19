package com.nexushr.enterprise.planning.service;

import com.nexushr.enterprise.planning.dto.SuccessionBenchDto;
import com.nexushr.enterprise.planning.dto.SuccessionRoleDto;
import com.nexushr.enterprise.planning.entity.SuccessionBench;
import com.nexushr.enterprise.planning.entity.SuccessionRole;
import com.nexushr.enterprise.planning.repository.SuccessionBenchRepository;
import com.nexushr.enterprise.planning.repository.SuccessionRoleRepository;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuccessionService {

    private final SuccessionRoleRepository roleRepository;
    private final SuccessionBenchRepository benchRepository;

    public List<SuccessionRoleDto> getAllRoles() {
        return roleRepository.findAll().stream().map(this::mapToRoleDto).collect(Collectors.toList());
    }

    public List<SuccessionBenchDto> getBenchForRole(UUID roleId) {
        return benchRepository.findByRoleId(roleId).stream().map(this::mapToBenchDto).collect(Collectors.toList());
    }

    private SuccessionRoleDto mapToRoleDto(SuccessionRole role) {
        SuccessionRoleDto dto = new SuccessionRoleDto();
        dto.setId(role.getId());
        dto.setTitle(role.getTitle());
        if (role.getDepartment() != null) {
            dto.setDepartmentName(role.getDepartment().getName());
        }
        if (role.getIncumbent() != null) {
            dto.setIncumbentName(role.getIncumbent().getFirstName() + " " + role.getIncumbent().getLastName());
        }
        dto.setIncumbentRisk(role.getIncumbentRisk());
        dto.setIsCritical(role.getIsCritical());
        return dto;
    }

    private SuccessionBenchDto mapToBenchDto(SuccessionBench bench) {
        SuccessionBenchDto dto = new SuccessionBenchDto();
        dto.setId(bench.getId());
        dto.setRoleId(bench.getRole().getId());
        dto.setEmployeeId(bench.getEmployee().getId());
        dto.setEmployeeName(bench.getEmployee().getFirstName() + " " + bench.getEmployee().getLastName());
        dto.setReadiness(bench.getReadiness());
        dto.setFlightRisk(bench.getFlightRisk());
        dto.setRank(bench.getRank());
        dto.setNotes(bench.getNotes());
        return dto;
    }
}
