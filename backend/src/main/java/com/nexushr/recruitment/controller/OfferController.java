package com.nexushr.recruitment.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.OfferDto;
import com.nexushr.recruitment.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recruitment/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService service;

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<List<OfferDto>> getByCandidate(@PathVariable UUID candidateId) {
        return ResponseEntity.ok(service.getByCandidate(candidateId));
    }

    @GetMapping("/job/{jobPostingId}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<List<OfferDto>> getByJobPosting(@PathVariable UUID jobPostingId) {
        return ResponseEntity.ok(service.getByJobPosting(jobPostingId));
    }

    @PostMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'CREATE')")
    public ResponseEntity<ApiResponse<OfferDto>> create(@RequestBody OfferDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<OfferDto>> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<OfferDto>> uploadOfferLetter(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadOfferLetter(id, file));
    }
}
