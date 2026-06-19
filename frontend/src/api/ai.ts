import apiClient, { type ApiResponse } from './client'

export interface AiInsight {
  id: string
  title: string
  description: string
  type: 'WARNING' | 'OPPORTUNITY' | 'RISK' | 'ACHIEVEMENT' | 'PREDICTION'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  module: 'ATTENDANCE' | 'PERFORMANCE' | 'PAYROLL' | 'LEAVES' | 'WORKFORCE' | 'ENGAGEMENT'
  affectedCount?: number
  affectedDepartment?: string
  recommendation?: string
  dataPoints?: Record<string, any>
  createdAt: string
}

export interface WorkforceAnalytics {
  attritionRisk: {
    score: number // 0–100
    highRiskEmployees: { employeeId: string; name: string; risk: number; factors: string[] }[]
    trend: { month: string; risk: number }[]
  }
  engagementScore: {
    overall: number
    byDepartment: { department: string; score: number }[]
    trend: { month: string; score: number }[]
  }
  skillGaps: {
    skill: string
    currentLevel: number
    requiredLevel: number
    affectedCount: number
  }[]
  headcountForecast: {
    month: string
    projected: number
    budget: number
  }[]
  payrollHealthScore: number
  attendanceHealthScore: number
}

export const aiApi = {
  getInsights: async (limit: number = 5): Promise<AiInsight[]> => {
    const res = await apiClient.get<ApiResponse<AiInsight[]>>(`/ai/insights?limit=${limit}`)
    return res.data.data
  },

  getWorkforceAnalytics: async (): Promise<WorkforceAnalytics> => {
    const res = await apiClient.get<ApiResponse<WorkforceAnalytics>>('/ai/analytics')
    return res.data.data
  },

  dismissInsight: async (id: string): Promise<void> => {
    await apiClient.put(`/ai/insights/${id}/dismiss`)
  },
}
