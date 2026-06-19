package com.nexushr.ai.controller;

import com.nexushr.ai.dto.AiInsightResponse;
import com.nexushr.ai.dto.WorkforceAnalyticsResponse;
import com.nexushr.ai.service.AiInsightService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Workforce Insights", description = "AI-powered analytics and workforce intelligence")
public class AiInsightController {

    private final AiInsightService aiInsightService;

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Workforce analytics", description = "Comprehensive workforce dashboard data")
    public ResponseEntity<ApiResponse<WorkforceAnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(aiInsightService.getWorkforceAnalytics());
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate AI insights", description = "Generate fresh insights across all modules (Admin only)")
    public ResponseEntity<ApiResponse<List<AiInsightResponse>>> generateInsights() {
        return ResponseEntity.ok(aiInsightService.generateInsights());
    }

    @PostMapping("/attrition-risk/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Predict attrition risk", description = "AI-powered attrition risk assessment for an employee")
    public ResponseEntity<ApiResponse<AiInsightResponse>> predictAttritionRisk(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(aiInsightService.generateAttritionRisk(employeeId));
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get active insights", description = "Paginated list of non-dismissed insights")
    public ResponseEntity<PagedResponse<AiInsightResponse>> getInsights(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(aiInsightService.getActiveInsights(page, size));
    }

    @GetMapping("/insights/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Insights by type", description = "Filter insights by type (ATTRITION_RISK, RECOMMENDATION, etc.)")
    public ResponseEntity<ApiResponse<List<AiInsightResponse>>> getByType(
            @PathVariable String type) {
        return ResponseEntity.ok(aiInsightService.getInsightsByType(type));
    }

    @GetMapping("/insights/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Employee insights", description = "Get AI insights for a specific employee")
    public ResponseEntity<ApiResponse<List<AiInsightResponse>>> getEmployeeInsights(
            @PathVariable UUID employeeId) {
        return ResponseEntity.ok(aiInsightService.getInsightsForEmployee(employeeId));
    }

    @PatchMapping("/insights/{insightId}/dismiss")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Dismiss insight", description = "Mark an insight as dismissed")
    public ResponseEntity<ApiResponse<Void>> dismissInsight(
            @PathVariable UUID insightId) {
        return ResponseEntity.ok(aiInsightService.dismissInsight(insightId));
    }

    @GetMapping("/provider")
    @Operation(summary = "AI provider info", description = "Get current AI provider name")
    public ResponseEntity<ApiResponse<String>> getProviderInfo() {
        return ResponseEntity.ok(aiInsightService.getAiProviderInfo());
    }
}
