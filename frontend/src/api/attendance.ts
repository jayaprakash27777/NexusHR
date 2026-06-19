import api from './client'

export interface AttendanceResponse {
  id: string
  employeeId: string
  employeeName?: string
  employeeCode?: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
  workHours: number
  notes: string | null
}

export interface AttendanceSummaryResponse {
  totalDays: number
  presentDays: number
  absentDays: number
  halfDays: number
  leaveDays: number
  averageWorkHours: number
}

export interface CheckInRequest {
  notes?: string
}

export const attendanceApi = {
  checkIn: async (employeeId: string, data?: CheckInRequest) => {
    const res = await api.post<{ data: AttendanceResponse }>(`/attendance/check-in/${employeeId}`, data || {})
    return res.data.data
  },

  checkOut: async (employeeId: string) => {
    const res = await api.post<{ data: AttendanceResponse }>(`/attendance/check-out/${employeeId}`)
    return res.data.data
  },

  getTodayAttendance: async (employeeId: string) => {
    const res = await api.get<{ data: AttendanceResponse }>(`/attendance/today/${employeeId}`)
    return res.data.data
  },

  getMonthlyAttendance: async (employeeId: string, year: number, month: number) => {
    const res = await api.get<{ data: AttendanceResponse[] }>(`/attendance/monthly/${employeeId}`, {
      params: { year, month }
    })
    return res.data.data
  },

  getMonthlySummary: async (employeeId: string, year: number, month: number) => {
    const res = await api.get<{ data: AttendanceSummaryResponse }>(`/attendance/summary/${employeeId}`, {
      params: { year, month }
    })
    return res.data.data
  },

  getHistory: async (employeeId: string, page = 0, size = 20) => {
    const res = await api.get<any>(`/attendance/history/${employeeId}`, {
      params: { page, size }
    })
    return res.data
  },

  getDailyReport: async (date: string) => {
    const res = await api.get<{ data: AttendanceResponse[] }>(`/attendance/daily-report`, {
      params: { date }
    })
    return res.data.data
  }
}
