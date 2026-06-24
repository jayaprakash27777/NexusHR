package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface CandidateService {
    PagedResponse<CandidateDto> getAll(int page, int size);
    ApiResponse<CandidateDto> getById(UUID id);
    ApiResponse<CandidateDto> create(CandidateDto request);
    ApiResponse<CandidateDto> update(UUID id, CandidateDto request);
    ApiResponse<CandidateDto> uploadResume(UUID id, MultipartFile file);
}
