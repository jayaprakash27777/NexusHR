package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobApplicationDto;

import java.util.List;
import java.util.UUID;

public interface JobApplicationService {
    List<JobApplicationDto> getByJobPosting(UUID jobPostingId);
    ApiResponse<JobApplicationDto> create(JobApplicationDto request);
    ApiResponse<JobApplicationDto> updateStatus(UUID id, String status);
}
