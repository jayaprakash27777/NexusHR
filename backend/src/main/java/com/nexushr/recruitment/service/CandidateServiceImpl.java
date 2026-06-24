package com.nexushr.recruitment.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.recruitment.dto.RecruitmentDtos.CandidateDto;
import com.nexushr.recruitment.model.Candidate;
import com.nexushr.recruitment.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final EmployeeRepository employeeRepository;
    private final RecruitmentAuditService auditService;
    private final String UPLOAD_DIR = "uploads/resumes/";

    @Override
    public PagedResponse<CandidateDto> getAll(int page, int size) {
        Page<Candidate> candidatePage = candidateRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<CandidateDto> content = candidatePage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.<CandidateDto>builder()
                .content(content)
                .totalElements(candidatePage.getTotalElements())
                .totalPages(candidatePage.getTotalPages())
                .size(candidatePage.getSize())
                .page(candidatePage.getNumber())
                .build();
    }

    @Override
    public ApiResponse<CandidateDto> getById(UUID id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));
        return ApiResponse.<CandidateDto>builder().success(true).data(mapToDto(candidate)).build();
    }

    @Override
    public ApiResponse<CandidateDto> create(CandidateDto request) {
        Employee internalEmployee = null;
        if (request.getInternalEmployeeId() != null) {
            internalEmployee = employeeRepository.findById(request.getInternalEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getInternalEmployeeId()));
        }

        Candidate candidate = Candidate.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .internalEmployee(internalEmployee)
                .build();

        Candidate saved = candidateRepository.save(candidate);
        auditService.logAction("CANDIDATE", saved.getId(), "CREATED", "Candidate profile created.");

        return ApiResponse.<CandidateDto>builder().success(true).data(mapToDto(saved)).build();
    }

    @Override
    public ApiResponse<CandidateDto> update(UUID id, CandidateDto request) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));

        candidate.setFirstName(request.getFirstName());
        candidate.setLastName(request.getLastName());
        candidate.setEmail(request.getEmail());
        candidate.setPhone(request.getPhone());

        if (request.getInternalEmployeeId() != null) {
            Employee internalEmployee = employeeRepository.findById(request.getInternalEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getInternalEmployeeId()));
            candidate.setInternalEmployee(internalEmployee);
        }

        Candidate saved = candidateRepository.save(candidate);
        auditService.logAction("CANDIDATE", saved.getId(), "UPDATED", "Candidate profile updated.");

        return ApiResponse.<CandidateDto>builder().success(true).data(mapToDto(saved)).build();
    }

    @Override
    public ApiResponse<CandidateDto> uploadResume(UUID id, MultipartFile file) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = id.toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            candidate.setResumeUrl("/uploads/resumes/" + filename);
            Candidate saved = candidateRepository.save(candidate);

            auditService.logAction("CANDIDATE", saved.getId(), "RESUME_UPLOADED", "Resume uploaded: " + filename);

            return ApiResponse.<CandidateDto>builder().success(true).data(mapToDto(saved)).message("Resume uploaded").build();

        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!", e);
        }
    }

    private CandidateDto mapToDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .resumeUrl(c.getResumeUrl())
                .internalEmployeeId(c.getInternalEmployee() != null ? c.getInternalEmployee().getId() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
