package com.nexushr.recruitment.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.recruitment.dto.RecruitmentDtos.JobPostingDto;
import com.nexushr.recruitment.service.JobPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/recruitment/jobs")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService service;

    @GetMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<PagedResponse<JobPostingDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'READ')")
    public ResponseEntity<ApiResponse<JobPostingDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasPermission('RECRUITMENT', 'CREATE')")
    public ResponseEntity<ApiResponse<JobPostingDto>> create(@RequestBody JobPostingDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'UPDATE')")
    public ResponseEntity<ApiResponse<JobPostingDto>> update(@PathVariable UUID id, @RequestBody JobPostingDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('RECRUITMENT', 'DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        return ResponseEntity.ok(service.delete(id));
    }
}
