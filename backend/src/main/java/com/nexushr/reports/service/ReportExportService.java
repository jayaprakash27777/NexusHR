package com.nexushr.reports.service;

import com.nexushr.reports.dto.ReportData;

public interface ReportExportService {
    String exportToCsv(ReportData data, String filenamePrefix);
    String exportToExcel(ReportData data, String filenamePrefix);
    String exportToPdf(ReportData data, String filenamePrefix);
}
