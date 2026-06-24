package com.nexushr.enterprise.knowledge.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.enterprise.knowledge.dto.ProductTourDto;
import com.nexushr.enterprise.knowledge.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/knowledge/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding Manager", description = "Product tours and onboarding management")
public class OnboardingController {

    private final OnboardingService service;

    @GetMapping("/tours")
    @Operation(summary = "Get all product tours")
    public ResponseEntity<ApiResponse<List<ProductTourDto>>> getTours() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllTours()));
    }

    @PostMapping("/tours/{id}/toggle")
    @Operation(summary = "Toggle a product tour status")
    public ResponseEntity<ApiResponse<ProductTourDto>> toggleTour(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.toggleTourStatus(id)));
    }

    @PutMapping("/tours/{id}")
    @Operation(summary = "Update a product tour")
    public ResponseEntity<ApiResponse<ProductTourDto>> updateTour(
            @PathVariable UUID id,
            @RequestBody ProductTourDto request) {
        return ResponseEntity.ok(ApiResponse.success(service.updateTour(id, request)));
    }
}
