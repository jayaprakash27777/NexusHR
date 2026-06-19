package com.nexushr.dashboard.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AnalyticsResponse;
import com.nexushr.dashboard.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics & Reporting", description = "Comprehensive HR analytics endpoints")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Comprehensive analytics", description = "Full HR analytics with headcount, salary, attendance, leave, and performance metrics (Admin only)")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getComprehensiveAnalytics());
    }
}
