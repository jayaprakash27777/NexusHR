import apiClient, { type ApiResponse } from './client'

export interface CompensationCycle {
  id: string
  name: string
  fiscalYear: number
  totalBudget: number
  status: string
}

export interface CompensationProposal {
  id: string
  cycleId: string
  employeeId: string
  employeeName: string
  role: string
  departmentName: string
  currentSalary: number
  proposedIncrease: number
  proposedBonus: number
  performanceScore: number
  compaRatio: number
  bandMin: number
  bandMax: number
  justification: string
}

export interface SuccessionRole {
  id: string
  title: string
  departmentName: string
  incumbentName: string
  incumbentRisk: string
  isCritical: boolean
}

export interface SuccessionBench {
  id: string
  roleId: string
  employeeId: string
  employeeName: string
  readiness: string
  flightRisk: string
  rank: number
  notes: string
}

export interface CareerRoleNode {
  id: string
  title: string
  level: string
  track: 'ic' | 'management'
  baseRange: [number, number]
  status: 'current' | 'next' | 'future'
  description: string
  requirements: string[]
}

export const planningApi = {
  getCareerPaths: async (): Promise<Record<string, CareerRoleNode[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, CareerRoleNode[]>>>('/planning/career-paths')
    return res.data.data
  },

  getCycles: async (): Promise<CompensationCycle[]> => {
    const res = await apiClient.get<ApiResponse<CompensationCycle[]>>('/planning/compensation/cycles')
    return res.data.data
  },

  getCycle: async (id: string): Promise<CompensationCycle> => {
    const res = await apiClient.get<ApiResponse<CompensationCycle>>(`/planning/compensation/cycles/${id}`)
    return res.data.data
  },

  getProposals: async (cycleId: string): Promise<CompensationProposal[]> => {
    const res = await apiClient.get<ApiResponse<CompensationProposal[]>>(`/planning/compensation/cycles/${cycleId}/proposals`)
    return res.data.data
  },

  updateProposal: async (id: string, data: Partial<CompensationProposal>): Promise<CompensationProposal> => {
    const res = await apiClient.put<ApiResponse<CompensationProposal>>(`/planning/compensation/proposals/${id}`, data)
    return res.data.data
  },

  getSuccessionRoles: async (): Promise<SuccessionRole[]> => {
    const res = await apiClient.get<ApiResponse<SuccessionRole[]>>('/planning/succession/roles')
    return res.data.data
  },

  getBenchForRole: async (roleId: string): Promise<SuccessionBench[]> => {
    const res = await apiClient.get<ApiResponse<SuccessionBench[]>>(`/planning/succession/roles/${roleId}/bench`)
    return res.data.data
  }
}
