package com.nexushr.recruitment.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.InterviewDto;
import com.nexushr.recruitment.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recruitment/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService service;

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<List<InterviewDto>> getByApplication(@PathVariable UUID applicationId) {
        return ResponseEntity.ok(service.getByApplication(applicationId));
    }

    @PostMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<InterviewDto>> schedule(@RequestBody InterviewDto request) {
        return ResponseEntity.ok(service.schedule(request));
    }

    @PatchMapping("/{id}/feedback")
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<InterviewDto>> submitFeedback(
            @PathVariable UUID id,
            @RequestParam String feedback,
            @RequestParam Integer rating) {
        return ResponseEntity.ok(service.submitFeedback(id, feedback, rating));
    }
}
