import api from './client'

export interface LeaveRequestResponse {
  id: string
  employeeId: string
  employeeName: string
  leaveType: 'CASUAL_LEAVE' | 'SICK_LEAVE' | 'EARNED_LEAVE' | 'WORK_FROM_HOME'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  approvedBy: string | null
  approverName: string | null
  reviewerRemarks: string | null
  appliedAt: string
}

export interface LeaveApplyRequest {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

export interface LeaveActionRequest {
  remarks?: string
}

export interface LeaveBalanceResponse {
  leaveType: string
  totalDays: number
  usedDays: number
  remainingDays: number
}

interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const leavesApi = {
  applyLeave: async (employeeId: string, data: LeaveApplyRequest) => {
    const res = await api.post<{ data: LeaveRequestResponse }>(`/leaves/apply/${employeeId}`, data)
    return res.data.data
  },

  approveLeave: async (leaveId: string, approverId: string, remarks?: string) => {
    const res = await api.patch<{ data: LeaveRequestResponse }>(`/leaves/${leaveId}/approve`, { remarks }, {
      params: { approverId }
    })
    return res.data.data
  },

  rejectLeave: async (leaveId: string, approverId: string, remarks?: string) => {
    const res = await api.patch<{ data: LeaveRequestResponse }>(`/leaves/${leaveId}/reject`, { remarks }, {
      params: { approverId }
    })
    return res.data.data
  },

  cancelLeave: async (leaveId: string, employeeId: string) => {
    const res = await api.patch<{ data: LeaveRequestResponse }>(`/leaves/${leaveId}/cancel`, {}, {
      params: { employeeId }
    })
    return res.data.data
  },

  getByEmployee: async (employeeId: string, page = 0, size = 10) => {
    const res = await api.get<PaginatedResponse<LeaveRequestResponse>>(`/leaves/employee/${employeeId}`, {
      params: { page, size }
    })
    return res.data
  },

  getPendingForManager: async (managerId: string, page = 0, size = 10) => {
    const res = await api.get<PaginatedResponse<LeaveRequestResponse>>(`/leaves/pending/manager/${managerId}`, {
      params: { page, size }
    })
    return res.data
  },

  getAllForManager: async (managerId: string, page = 0, size = 10) => {
    const res = await api.get<PaginatedResponse<LeaveRequestResponse>>(`/leaves/team/${managerId}`, {
      params: { page, size }
    })
    return res.data
  },

  getLeaveBalances: async (employeeId: string, year = new Date().getFullYear()) => {
    const res = await api.get<{ data: LeaveBalanceResponse[] }>(`/leaves/balance/${employeeId}`, {
      params: { year }
    })
    return res.data.data
  }
}
