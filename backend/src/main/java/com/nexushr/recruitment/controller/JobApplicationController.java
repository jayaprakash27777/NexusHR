package com.nexushr.recruitment.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobApplicationDto;
import com.nexushr.recruitment.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recruitment/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService service;

    @GetMapping("/job/{jobPostingId}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<List<JobApplicationDto>> getByJobPosting(@PathVariable UUID jobPostingId) {
        return ResponseEntity.ok(service.getByJobPosting(jobPostingId));
    }

    @PostMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'CREATE')")
    public ResponseEntity<ApiResponse<JobApplicationDto>> create(@RequestBody JobApplicationDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<JobApplicationDto>> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
