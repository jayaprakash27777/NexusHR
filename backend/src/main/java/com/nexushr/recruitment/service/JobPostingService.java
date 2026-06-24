package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobPostingDto;

import java.util.UUID;

public interface JobPostingService {
    PagedResponse<JobPostingDto> getAll(int page, int size);
    ApiResponse<JobPostingDto> getById(UUID id);
    ApiResponse<JobPostingDto> create(JobPostingDto request);
    ApiResponse<JobPostingDto> update(UUID id, JobPostingDto request);
    ApiResponse<Void> delete(UUID id);
}
