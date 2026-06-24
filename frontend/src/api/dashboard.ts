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
  
  // Security
  activeSessions: number
  failedLoginAttempts: number
  lockedAccounts: number

  employeesByDepartment: Record<string, number>
  employeesByStatus: Record<string, number>
  attendanceTrend: AttendanceTrendPoint[]
  payrollTrend: PayrollTrendPoint[]
  recentActivity?: RecentActivityItem[]
  recentlyJoinedEmployees?: EmployeeSummaryDto[]
  recentlyResignedEmployees?: EmployeeSummaryDto[]
  employeesOnProbation?: EmployeeSummaryDto[]
}

export interface EmployeeSummaryDto {
  id: string
  employeeId: string
  name: string
  email: string
  department: string
  designation: string
  joiningDate: string
  status: string
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

export interface ManagerDashboardResponse {
  teamSize: number
  activeTeamMembers: number
  departmentName: string
  teamPresentToday: number
  teamAbsentToday: number
  teamAttendanceRate: number
  pendingLeaveApprovals: number
  approvedLeavesThisMonth: number
  pendingPerformanceReviews: number
  teamAvgPerformanceRating: number
  goalsInProgress: number
  goalsCompleted: number
  goalsNotStarted?: number
  teamMembers: { employeeId: string; name: string; designation: string; status: string; presentToday: boolean }[]
  teamSchedule: any[]
  pendingActions: any[]
  leaveTrend: Record<string, number>
}

export interface HRDashboardResponse {
  totalHeadcount: number
  headcountChangeThisMonth: number
  openRequisitions: number
  urgentRequisitions: number
  attritionRate: number
  attritionRateChange: number
  avgTimeToFillDays: number
  recentHires: any[]
  activeRequisitions: any[]
  headcountTrend: Record<string, number>
}

export interface FinanceDashboardResponse {
  totalMonthlyPayroll: number
  payrollChangePercentage: number
  ytdBonusPayouts: number
  bonusChangePercentage: number
  pendingReimbursements: number
  reimbursementChangePercentage: number
  taxWithheldYtd: number
  taxChangePercentage: number
  recentPayrollRuns: any[]
  pendingExpenses: any[]
  expenseTrend: Record<string, number>
  payrollTrend?: Record<string, number>
  totalPayrollCost?: number
  avgSalary?: number
  pendingExpenseClaims?: number
  departmentPayroll?: Record<string, number>
}

export interface ExecutiveDashboardResponse {
  workforceHealthScore: number
  activeUsers: number
  totalHeadcount: number
  attritionRate: number
  attritionHeatmap: { department: string; riskLevel: number }[]
  predictiveMetrics: { subject: string; departmentScores: Record<string, number>; fullMark: number }[]
  recentActivity: RecentActivityItem[]
}

export interface AuditorDashboardResponse {
  totalAuditEvents: number
  recentSecurityAlerts: number
  activeSessions: number
  policyViolations: number
  auditEventsByType: Record<string, number>
  recentAuditLogs: {
    id: string
    userId: string
    action: string
    entityType: string
    entityId: string
    createdAt: string
  }[]
}

export interface EmployeeDashboardResponse {
  employeeId: string
  name: string
  department: string
  designation: string
  attendanceStatus: string
  checkInTime?: string
  checkOutTime?: string
  workHoursToday: number
  presentDaysThisMonth: number
  totalWorkingDaysThisMonth: number
  attendancePercentage: number
  leaveBalances: {
    leaveType: string
    total: number
    used: number
    remaining: number
  }[]
  pendingLeaveRequests: number
  lastMonthNetSalary: number
  lastPayrollMonth: string
  latestPerformanceRating: number
  activeGoals: number
  completedGoals: number
  unreadNotifications: number
  recentDocuments: { name: string; date: string; type: string }[]
  upcomingGoals: { title: string; progress: string; dueDate: string }[]
  attendanceTrend: Record<string, number>
}

export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<AdminDashboardResponse>>('/dashboard/admin')
    return res.data.data
  },

  getEmployeeDashboard: async (employeeId: string): Promise<EmployeeDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<EmployeeDashboardResponse>>(`/dashboard/employee/${employeeId}`)
    return res.data.data
  },

  getManagerDashboard: async (): Promise<ManagerDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<ManagerDashboardResponse>>('/dashboard/manager')
    return res.data.data
  },

  getHRDashboard: async (): Promise<HRDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<HRDashboardResponse>>('/dashboard/hr')
    return res.data.data
  },

  getFinanceDashboard: async (): Promise<FinanceDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<FinanceDashboardResponse>>('/dashboard/finance')
    return res.data.data
  },

  getAnalytics: async (period: '3M' | '6M' | '1Y' = '6M'): Promise<AnalyticsResponse> => {
    const res = await apiClient.get<ApiResponse<AnalyticsResponse>>(`/analytics?period=${period}`)
    return res.data.data
  },

  getExecutiveDashboard: async (): Promise<ExecutiveDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<ExecutiveDashboardResponse>>('/dashboard/executive')
    return res.data.data
  },

  getAuditorDashboard: async (): Promise<AuditorDashboardResponse> => {
    const res = await apiClient.get<ApiResponse<AuditorDashboardResponse>>('/dashboard/auditor')
    return res.data.data
  },
}
