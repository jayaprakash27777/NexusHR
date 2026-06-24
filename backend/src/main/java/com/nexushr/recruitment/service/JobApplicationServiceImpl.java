package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobApplicationDto;
import com.nexushr.recruitment.dto.RecruitmentDtos.CandidateDto;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobPostingDto;
import com.nexushr.recruitment.model.ApplicationStatus;
import com.nexushr.recruitment.model.Candidate;
import com.nexushr.recruitment.model.JobApplication;
import com.nexushr.recruitment.model.JobPosting;
import com.nexushr.recruitment.repository.CandidateRepository;
import com.nexushr.recruitment.repository.JobApplicationRepository;
import com.nexushr.recruitment.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobPostingRepository jobPostingRepository;
    private final RecruitmentAuditService auditService;

    @Override
    public List<JobApplicationDto> getByJobPosting(UUID jobPostingId) {
        return jobApplicationRepository.findByJobPostingId(jobPostingId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ApiResponse<JobApplicationDto> create(JobApplicationDto request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", request.getCandidateId()));
        
        JobPosting jobPosting = jobPostingRepository.findById(request.getJobPostingId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", request.getJobPostingId()));

        JobApplication application = JobApplication.builder()
                .candidate(candidate)
                .jobPosting(jobPosting)
                .status(ApplicationStatus.NEW)
                .notes(request.getNotes())
                .build();

        JobApplication saved = jobApplicationRepository.save(application);
        auditService.logAction("APPLICATION", saved.getId(), "CREATED", "Application submitted for " + jobPosting.getTitle());

        return ApiResponse.<JobApplicationDto>builder().success(true).data(mapToDto(saved)).build();
    }

    @Override
    public ApiResponse<JobApplicationDto> updateStatus(UUID id, String status) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        
        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newStatus = ApplicationStatus.valueOf(status);
        application.setStatus(newStatus);
        
        JobApplication saved = jobApplicationRepository.save(application);
        auditService.logAction("APPLICATION", saved.getId(), "STATUS_CHANGED", "Status changed from " + oldStatus + " to " + newStatus);

        return ApiResponse.<JobApplicationDto>builder().success(true).data(mapToDto(saved)).build();
    }

    private JobApplicationDto mapToDto(JobApplication app) {
        Candidate c = app.getCandidate();
        CandidateDto cDto = CandidateDto.builder()
                .id(c.getId()).firstName(c.getFirstName()).lastName(c.getLastName())
                .email(c.getEmail()).phone(c.getPhone()).resumeUrl(c.getResumeUrl())
                .build();

        JobPosting j = app.getJobPosting();
        JobPostingDto jDto = JobPostingDto.builder()
                .id(j.getId()).title(j.getTitle()).departmentName(j.getDepartment() != null ? j.getDepartment().getName() : null)
                .build();

        return JobApplicationDto.builder()
                .id(app.getId())
                .candidateId(c.getId())
                .candidate(cDto)
                .jobPostingId(j.getId())
                .jobPosting(jDto)
                .status(app.getStatus().name())
                .notes(app.getNotes())
                .createdAt(app.getCreatedAt())
                .build();
    }
}
