package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.OfferDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface OfferService {
    List<OfferDto> getByCandidate(UUID candidateId);
    List<OfferDto> getByJobPosting(UUID jobPostingId);
    ApiResponse<OfferDto> create(OfferDto request);
    ApiResponse<OfferDto> updateStatus(UUID id, String status);
    ApiResponse<OfferDto> uploadOfferLetter(UUID id, MultipartFile file);
}
