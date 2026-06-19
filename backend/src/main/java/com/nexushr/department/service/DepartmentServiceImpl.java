package com.nexushr.department.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.department.dto.DepartmentRequest;
import com.nexushr.department.dto.DepartmentResponse;
import com.nexushr.department.model.Department;
import com.nexushr.department.repository.DepartmentRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public ApiResponse<DepartmentResponse> create(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Department with name '" + request.getName() + "' already exists");
        }
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Department with code '" + request.getCode() + "' already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .managerId(request.getManagerId())
                .active(true)
                .build();

        Department saved = departmentRepository.save(department);
        log.info("Department created: {} ({})", saved.getName(), saved.getCode());

        return ApiResponse.success("Department created successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<DepartmentResponse> update(UUID id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        // Check unique constraints if values changed
        if (!department.getName().equals(request.getName()) && departmentRepository.existsByName(request.getName())) {
            throw new BadRequestException("Department with name '" + request.getName() + "' already exists");
        }
        if (!department.getCode().equals(request.getCode().toUpperCase()) && departmentRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new BadRequestException("Department with code '" + request.getCode() + "' already exists");
        }

        department.setName(request.getName());
        department.setCode(request.getCode().toUpperCase());
        department.setDescription(request.getDescription());
        department.setManagerId(request.getManagerId());

        Department updated = departmentRepository.save(department);
        log.info("Department updated: {} ({})", updated.getName(), updated.getCode());

        return ApiResponse.success("Department updated successfully", mapToResponse(updated));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DepartmentResponse> getById(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return ApiResponse.success(mapToResponse(department));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DepartmentResponse> getByCode(String code) {
        Department department = departmentRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "code", code));
        return ApiResponse.success(mapToResponse(department));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DepartmentResponse>> getAll() {
        List<DepartmentResponse> departments = departmentRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(departments);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DepartmentResponse> getAllPaged(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Department> departmentPage = departmentRepository.findAll(pageable);
        return buildPagedResponse(departmentPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DepartmentResponse> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Department> departmentPage = departmentRepository.search(query, pageable);
        return buildPagedResponse(departmentPage);
    }

    @Override
    @Transactional
    public ApiResponse<Void> delete(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        long employeeCount = departmentRepository.countActiveEmployees(id);
        if (employeeCount > 0) {
            throw new BadRequestException(
                    "Cannot delete department '" + department.getName() +
                    "'. It has " + employeeCount + " active employee(s). Reassign them first.");
        }

        department.setActive(false);
        departmentRepository.save(department);
        log.info("Department soft-deleted: {} ({})", department.getName(), department.getCode());

        return ApiResponse.success("Department deleted successfully");
    }

    @Override
    @Transactional
    public ApiResponse<DepartmentResponse> assignManager(UUID departmentId, UUID managerId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));

        if (managerId != null) {
            employeeRepository.findById(managerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", managerId));
        }

        department.setManagerId(managerId);
        Department updated = departmentRepository.save(department);
        log.info("Manager assigned to department {}: {}", department.getCode(), managerId);

        return ApiResponse.success("Manager assigned successfully", mapToResponse(updated));
    }

    private DepartmentResponse mapToResponse(Department department) {
        String managerName = null;
        if (department.getManagerId() != null) {
            managerName = employeeRepository.findById(department.getManagerId())
                    .map(Employee::getFullName)
                    .orElse(null);
        }

        long employeeCount = departmentRepository.countActiveEmployees(department.getId());

        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .code(department.getCode())
                .description(department.getDescription())
                .managerId(department.getManagerId())
                .managerName(managerName)
                .active(department.isActive())
                .employeeCount(employeeCount)
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }

    private PagedResponse<DepartmentResponse> buildPagedResponse(Page<Department> page) {
        List<DepartmentResponse> content = page.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<DepartmentResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
