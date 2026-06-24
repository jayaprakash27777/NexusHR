package com.nexushr.reports.service;

import com.nexushr.reports.dto.ReportData;
import java.util.Map;

public interface ReportDataService {
    ReportData getReportData(String reportType, Map<String, Object> filters);
}
