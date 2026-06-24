package com.nexushr.recruitment.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.CandidateDto;
import com.nexushr.recruitment.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/recruitment/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService service;

    @GetMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<PagedResponse<CandidateDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<ApiResponse<CandidateDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'CREATE')")
    public ResponseEntity<ApiResponse<CandidateDto>> create(@RequestBody CandidateDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<CandidateDto>> update(@PathVariable UUID id, @RequestBody CandidateDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @PostMapping(value = "/{id}/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<CandidateDto>> uploadResume(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadResume(id, file));
    }
}
