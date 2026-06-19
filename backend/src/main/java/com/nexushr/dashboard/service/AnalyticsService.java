package com.nexushr.dashboard.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.dashboard.dto.AnalyticsResponse;

public interface AnalyticsService {

    ApiResponse<AnalyticsResponse> getComprehensiveAnalytics();
}
