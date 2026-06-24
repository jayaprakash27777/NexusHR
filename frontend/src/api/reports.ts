import apiClient from './client';

export interface ReportRequest {
  reportType: string;
  format: string;
  filters?: Record<string, any>;
}

export interface ReportHistoryDto {
  id: string;
  reportType: string;
  generatedByName: string;
  fileUrl: string;
  format: string;
  filters: Record<string, any>;
  status: string;
  createdAt: string;
}

export interface ReportScheduleDto {
  id: string;
  reportType: string;
  cronExpression: string;
  format: string;
  filters: Record<string, any>;
  status: string;
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
}

export const generateReport = async (request: ReportRequest): Promise<ReportHistoryDto> => {
  const response = await apiClient.post('/reports/generate', request);
  return response.data.data;
};

export const getReportHistory = async (page = 0, size = 50): Promise<ReportHistoryDto[]> => {
  const response = await apiClient.get('/reports/history', { params: { page, size } });
  return response.data.data;
};

export const getReportSchedules = async (): Promise<ReportScheduleDto[]> => {
  const response = await apiClient.get('/reports/schedules');
  return response.data.data;
};

export const createReportSchedule = async (request: Partial<ReportScheduleDto>): Promise<ReportScheduleDto> => {
  const response = await apiClient.post('/reports/schedules', request);
  return response.data.data;
};

export const deleteReportSchedule = async (id: string): Promise<void> => {
  await apiClient.delete(`/reports/schedules/${id}`);
};
