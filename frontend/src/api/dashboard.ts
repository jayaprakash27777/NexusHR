import apiClient, { type ApiResponse } from './client'

export interface AdminDashboardResponse {
  totalEmployees: number
  activeEmployees: number
  onNoticeEmployees: number
  newHiresThisMonth: number
  totalDepartments: number
  presentToday: number
  absentToday: number
  attendanceRateToday: number
  pendingLeaveRequests: number
  approvedLeavesToday: number
  currentMonthPayroll: number
  payrollsPending: number
  payrollsPaid: number
  pendingReviews: number
  averagePerformanceRating: number
  activeInsights: number
  criticalInsights: number
  unreadNotifications: number
  employeesByDepartment: Record<string, number>
  employeesByStatus: Record<string, number>
  attendanceTrend: AttendanceTrendPoint[]
  payrollTrend: PayrollTrendPoint[]
  recentActivity?: RecentActivityItem[]
}

export interface AttendanceTrendPoint {
  month: string
  rate: number
  present: number
  absent: number
  late: number
}

export interface DepartmentDistribution {
  name: string
  count: number
  color: string
}

export interface PayrollTrendPoint {
  month: string
  amount: number
  employees: number
}

export interface RecentActivityItem {
  id: string
  user: string
  action: string
  time: string
  type: 'attendance' | 'leave' | 'review' | 'payroll' | 'goal' | 'employee' | 'system'
  entityId?: string
}



export interface AnalyticsResponse {
  hiringTrend: { month: string; hired: number; terminated: number }[]
  leaveTrend: { month: string; approved: number; pending: number; rejected: number }[]
  performanceTrend: { month: string; averageScore: number; reviewed: number }[]
  attritionTrend: { month: string; rate: number }[]
}

export interface EmployeeDashboardResponse {
  employee: {
    id: string
    fullName: string
    designation: string
    department: string
    manager?: string
    dateOfJoining: string
  }
  todayAttendance: {
    status: 'PRESENT' | 'ABSENT' | 'NOT_MARKED'
    checkInTime?: string
    checkOutTime?: string
    workingHours?: number
  }
  leaveBalance: Record<string, number>
  pendingReviews: number
  pendingGoals: number
  recentPayslip?: {
    month: string
    netSalary: number
    id: string
  }
  announcements: { id: string; title: string; content: string; date: string }[]
}

export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardResponse>>('/dashboard/admin')
    return res.data.data
  },

  getEmployeeDashboard: async (): Promise<EmployeeDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<EmployeeDashboardResponse>>('/dashboard/employee')
    return res.data.data
  },

  getManagerDashboard: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/dashboard/manager')
    return res.data.data
  },

  getAnalytics: async (period: '3M' | '6M' | '1Y' = '6M'): Promise<AnalyticsResponse> => {
    const res = await apiClient.get<ApiResponse<AnalyticsResponse>>(`/analytics?period=${period}`)
    return res.data.data
  },
}
