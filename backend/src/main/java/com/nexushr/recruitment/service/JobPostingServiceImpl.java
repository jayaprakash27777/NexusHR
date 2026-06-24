package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.department.model.Department;
import com.nexushr.department.repository.DepartmentRepository;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobPostingDto;
import com.nexushr.recruitment.model.JobPosting;
import com.nexushr.recruitment.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final DepartmentRepository departmentRepository;
    private final RecruitmentAuditService auditService;

    @Override
    public PagedResponse<JobPostingDto> getAll(int page, int size) {
        Page<JobPosting> jobPage = jobPostingRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<JobPostingDto> content = jobPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.<JobPostingDto>builder()
                .content(content)
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .size(jobPage.getSize())
                .page(jobPage.getNumber())
                .build();
    }

    @Override
    public ApiResponse<JobPostingDto> getById(UUID id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", id));
        return ApiResponse.<JobPostingDto>builder()
                .success(true)
                .data(mapToDto(job))
                .build();
    }

    @Override
    public ApiResponse<JobPostingDto> create(JobPostingDto request) {
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
        }

        JobPosting job = JobPosting.builder()
                .title(request.getTitle())
                .department(department)
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .build();

        JobPosting saved = jobPostingRepository.save(job);
        auditService.logAction("JOB_POSTING", saved.getId(), "CREATED", "Job posting '" + saved.getTitle() + "' created.");

        return ApiResponse.<JobPostingDto>builder()
                .success(true)
                .data(mapToDto(saved))
                .message("Job posting created successfully")
                .build();
    }

    @Override
    public ApiResponse<JobPostingDto> update(UUID id, JobPostingDto request) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", id));

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            job.setDepartment(department);
        }

        job.setTitle(request.getTitle());
        job.setLocation(request.getLocation());
        if (request.getStatus() != null) job.setStatus(request.getStatus());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());

        JobPosting saved = jobPostingRepository.save(job);
        auditService.logAction("JOB_POSTING", saved.getId(), "UPDATED", "Job posting '" + saved.getTitle() + "' updated.");

        return ApiResponse.<JobPostingDto>builder()
                .success(true)
                .data(mapToDto(saved))
                .message("Job posting updated successfully")
                .build();
    }

    @Override
    public ApiResponse<Void> delete(UUID id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", id));
        jobPostingRepository.delete(job);
        auditService.logAction("JOB_POSTING", id, "DELETED", "Job posting deleted.");

        return ApiResponse.<Void>builder()
                .success(true)
                .message("Job posting deleted successfully")
                .build();
    }

    private JobPostingDto mapToDto(JobPosting job) {
        return JobPostingDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .departmentId(job.getDepartment() != null ? job.getDepartment().getId() : null)
                .departmentName(job.getDepartment() != null ? job.getDepartment().getName() : null)
                .location(job.getLocation())
                .status(job.getStatus())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .createdAt(job.getCreatedAt())
                .build();
    }
}
