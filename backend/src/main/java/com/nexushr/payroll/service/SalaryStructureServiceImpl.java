package com.nexushr.payroll.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.payroll.dto.SalaryStructureRequest;
import com.nexushr.payroll.dto.SalaryStructureResponse;
import com.nexushr.payroll.model.SalaryStructure;
import com.nexushr.payroll.repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalaryStructureServiceImpl implements SalaryStructureService {

    private final SalaryStructureRepository salaryStructureRepository;

    @Override
    @Transactional
    public ApiResponse<SalaryStructureResponse> createStructure(SalaryStructureRequest request) {
        if (salaryStructureRepository.existsByName(request.getName())) {
            throw new BadRequestException("Salary structure with name '" + request.getName() + "' already exists");
        }

        SalaryStructure structure = SalaryStructure.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basicSalary(request.getBasicSalary())
                .hraPercentage(request.getHraPercentage())
                .daPercentage(request.getDaPercentage())
                .pfPercentage(request.getPfPercentage())
                .esiPercentage(request.getEsiPercentage())
                .otherAllowances(request.getOtherAllowances())
                .active(request.isActive())
                .build();

        SalaryStructure saved = salaryStructureRepository.save(structure);
        log.info("Created salary structure: {}", saved.getName());
        return ApiResponse.success("Salary structure created successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<SalaryStructureResponse> updateStructure(UUID id, SalaryStructureRequest request) {
        SalaryStructure structure = salaryStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));

        if (salaryStructureRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("Salary structure with name '" + request.getName() + "' already exists");
        }

        structure.setName(request.getName());
        structure.setDescription(request.getDescription());
        structure.setBasicSalary(request.getBasicSalary());
        structure.setHraPercentage(request.getHraPercentage());
        structure.setDaPercentage(request.getDaPercentage());
        structure.setPfPercentage(request.getPfPercentage());
        structure.setEsiPercentage(request.getEsiPercentage());
        structure.setOtherAllowances(request.getOtherAllowances());
        structure.setActive(request.isActive());

        SalaryStructure saved = salaryStructureRepository.save(structure);
        log.info("Updated salary structure: {}", saved.getName());
        return ApiResponse.success("Salary structure updated successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteStructure(UUID id) {
        if (!salaryStructureRepository.existsById(id)) {
            throw new ResourceNotFoundException("SalaryStructure", "id", id);
        }
        // In a real system, we'd check if any Employee is linked to this structure before deleting.
        // For now, simple delete.
        salaryStructureRepository.deleteById(id);
        log.info("Deleted salary structure: {}", id);
        return ApiResponse.success("Salary structure deleted successfully", null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<SalaryStructureResponse> getStructureById(UUID id) {
        SalaryStructure structure = salaryStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));
        return ApiResponse.success(mapToResponse(structure));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<SalaryStructureResponse>> getAllStructures() {
        List<SalaryStructureResponse> structures = salaryStructureRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success(structures);
    }

    private SalaryStructureResponse mapToResponse(SalaryStructure s) {
        return SalaryStructureResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .basicSalary(s.getBasicSalary())
                .hraPercentage(s.getHraPercentage())
                .daPercentage(s.getDaPercentage())
                .pfPercentage(s.getPfPercentage())
                .esiPercentage(s.getEsiPercentage())
                .otherAllowances(s.getOtherAllowances())
                .active(s.isActive())
                .build();
    }
}
