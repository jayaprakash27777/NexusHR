package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.InterviewDto;

import java.util.List;
import java.util.UUID;

public interface InterviewService {
    List<InterviewDto> getByApplication(UUID applicationId);
    ApiResponse<InterviewDto> schedule(InterviewDto request);
    ApiResponse<InterviewDto> submitFeedback(UUID id, String feedback, Integer rating);
}
