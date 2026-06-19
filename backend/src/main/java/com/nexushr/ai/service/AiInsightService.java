package com.nexushr.ai.service;

import com.nexushr.ai.dto.AiInsightResponse;
import com.nexushr.ai.dto.WorkforceAnalyticsResponse;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;

import java.util.List;
import java.util.UUID;

public interface AiInsightService {

    ApiResponse<WorkforceAnalyticsResponse> getWorkforceAnalytics();

    ApiResponse<List<AiInsightResponse>> generateInsights();

    ApiResponse<AiInsightResponse> generateAttritionRisk(UUID employeeId);

    PagedResponse<AiInsightResponse> getActiveInsights(int page, int size);

    ApiResponse<List<AiInsightResponse>> getInsightsByType(String type);

    ApiResponse<List<AiInsightResponse>> getInsightsForEmployee(UUID employeeId);

    ApiResponse<Void> dismissInsight(UUID insightId);

    ApiResponse<String> getAiProviderInfo();
}
