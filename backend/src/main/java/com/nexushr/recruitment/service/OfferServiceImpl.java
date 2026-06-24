package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.recruitment.dto.RecruitmentDtos.CandidateDto;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobPostingDto;
import com.nexushr.recruitment.dto.RecruitmentDtos.OfferDto;
import com.nexushr.recruitment.model.Candidate;
import com.nexushr.recruitment.model.JobPosting;
import com.nexushr.recruitment.model.Offer;
import com.nexushr.recruitment.repository.CandidateRepository;
import com.nexushr.recruitment.repository.JobPostingRepository;
import com.nexushr.recruitment.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements OfferService {

    private final OfferRepository offerRepository;
    private final CandidateRepository candidateRepository;
    private final JobPostingRepository jobPostingRepository;
    private final RecruitmentAuditService auditService;
    private final String UPLOAD_DIR = "uploads/offers/";

    @Override
    public List<OfferDto> getByCandidate(UUID candidateId) {
        return offerRepository.findByCandidateId(candidateId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OfferDto> getByJobPosting(UUID jobPostingId) {
        return offerRepository.findByJobPostingId(jobPostingId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ApiResponse<OfferDto> create(OfferDto request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", request.getCandidateId()));
        
        JobPosting jobPosting = jobPostingRepository.findById(request.getJobPostingId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", request.getJobPostingId()));

        Offer offer = Offer.builder()
                .candidate(candidate)
                .jobPosting(jobPosting)
                .salary(request.getSalary())
                .status("DRAFT")
                .notes(request.getNotes())
                .expiresAt(request.getExpiresAt())
                .build();

        Offer saved = offerRepository.save(offer);
        auditService.logAction("OFFER", saved.getId(), "CREATED", "Offer generated for " + candidate.getFirstName() + " " + candidate.getLastName());

        return ApiResponse.<OfferDto>builder().success(true).data(mapToDto(saved)).build();
    }

    @Override
    public ApiResponse<OfferDto> updateStatus(UUID id, String status) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));
        
        String oldStatus = offer.getStatus();
        offer.setStatus(status);
        
        Offer saved = offerRepository.save(offer);
        auditService.logAction("OFFER", saved.getId(), "STATUS_CHANGED", "Offer status changed from " + oldStatus + " to " + status);

        return ApiResponse.<OfferDto>builder().success(true).data(mapToDto(saved)).build();
    }

    @Override
    public ApiResponse<OfferDto> uploadOfferLetter(UUID id, MultipartFile file) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = id.toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            offer.setFileUrl("/uploads/offers/" + filename);
            offer.setStatus("SENT"); // Sending the offer
            Offer saved = offerRepository.save(offer);

            auditService.logAction("OFFER", saved.getId(), "DOCUMENT_UPLOADED", "Offer document uploaded and status changed to SENT.");

            return ApiResponse.<OfferDto>builder().success(true).data(mapToDto(saved)).message("Offer document uploaded").build();

        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", e);
        }
    }

    private OfferDto mapToDto(Offer o) {
        Candidate c = o.getCandidate();
        CandidateDto cDto = CandidateDto.builder()
                .id(c.getId()).firstName(c.getFirstName()).lastName(c.getLastName())
                .email(c.getEmail()).phone(c.getPhone())
                .build();

        JobPosting j = o.getJobPosting();
        JobPostingDto jDto = JobPostingDto.builder()
                .id(j.getId()).title(j.getTitle()).departmentName(j.getDepartment() != null ? j.getDepartment().getName() : null)
                .build();

        return OfferDto.builder()
                .id(o.getId())
                .candidateId(c.getId())
                .candidate(cDto)
                .jobPostingId(j.getId())
                .jobPosting(jDto)
                .salary(o.getSalary())
                .status(o.getStatus())
                .fileUrl(o.getFileUrl())
                .notes(o.getNotes())
                .expiresAt(o.getExpiresAt())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
