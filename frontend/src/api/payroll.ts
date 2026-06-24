import api, { PagedResponse, ApiResponse } from './client'

export interface PayrollResponse {
  id: string
  employeeId: string
  employeeName: string
  department: string
  month: number
  year: number
  basicSalary: number
  hra: number
  da: number
  otherAllowances: number
  grossSalary: number
  pfDeduction: number
  professionalTax: number
  incomeTax: number
  esiDeduction: number
  otherDeductions: number
  totalDeductions: number
  bonus: number
  netSalary: number
  currency: string
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'FAILED' | 'REVERSED'
  processedAt: string | null
  paidAt: string | null
}

export interface PayrollSummaryResponse {
  totalGrossSalary: number
  totalNetSalary: number
  totalDeductions: number
  averageSalary: number
  totalEmployeesProcessed: number
  totalApproved: number
  totalLocked: number
  totalPaid: number
  totalPending: number
  month: number
  year: number
  currentPayrollCycle: string
  nextPayrollDate: string
}

export interface SalaryStructureRequest {
  name: string
  description?: string
  basicSalary: number
  hraPercentage: number
  daPercentage: number
  pfPercentage: number
  esiPercentage: number
  otherAllowances: number
  active: boolean
}

export interface SalaryStructureResponse extends SalaryStructureRequest {
  id: string
}

export interface PayrollAuditLogResponse {
  id: string
  month: number
  year: number
  action: string
  actionBy: string
  details: string
  timestamp: string
}

export interface PayrollAnalyticsResponse {
  monthlyCosts: { label: string; cost: number }[]
  departmentCosts: { department: string; cost: number }[]
  salaryDistribution: { range: string; count: number }[]
}

export const payrollApi = {
  // Get paginated history for a specific employee
  getEmployeeHistory: async (employeeId: string, page = 0, size = 12) => {
    const res = await api.get<PagedResponse<PayrollResponse>>(`/payroll/employee/${employeeId}/history`, {
      params: { page, size }
    })
    return res.data
  },

  // Get single payroll for employee by month/year
  getByEmployeeAndMonth: async (employeeId: string, month: number, year: number) => {
    const res = await api.get<ApiResponse<PayrollResponse>>(`/payroll/employee/${employeeId}`, {
      params: { month, year }
    })
    return res.data
  },

  // Admin: Get all payrolls for a specific month
  getMonthlyPayroll: async (month: number, year: number) => {
    const res = await api.get<ApiResponse<PayrollResponse[]>>(`/payroll/monthly`, {
      params: { month, year }
    })
    return res.data.data
  },



  revertPayroll: async (id: string) => {
    const res = await api.post<{ data: PayrollResponse }>(`/payroll/revert/${id}`)
    return res.data.data
  },

  exportBankFile: (month: number, year: number) => {
    // Return the URL for downloading
    return `${api.defaults.baseURL || (import.meta.env.PROD ? 'https://nexushr-fxe4.onrender.com/api' : '/api')}/payroll/export/bank?month=${month}&year=${year}`
  },

  // Admin: Search and paginate monthly payroll
  searchMonthlyPayroll: async (month: number, year: number, search: string, department: string, page = 0, size = 10, sort = 'employeeName', dir = 'asc') => {
    const res = await api.get<PagedResponse<PayrollResponse>>(`/payroll/search`, {
      params: { month, year, search, department, page, size, sort, dir }
    })
    return res.data
  },

  // Admin: Get summary statistics for a month
  getMonthlySummary: async (month: number, year: number) => {
    const res = await api.get<ApiResponse<PayrollSummaryResponse>>(`/payroll/summary`, {
      params: { month, year }
    })
    return res.data.data
  },

  // Admin: Get analytics
  getAnalytics: async (month: number, year: number) => {
    const res = await api.get<ApiResponse<PayrollAnalyticsResponse>>(`/payroll/analytics`, {
      params: { month, year }
    })
    return res.data.data
  },

  // Admin: Process payroll for a single employee
  processPayroll: async (employeeId: string, month: number, year: number, bonus: number = 0, deductions: number = 0) => {
    const res = await api.post<ApiResponse<PayrollResponse>>('/payroll/process', {
      employeeId, month, year, bonus, deductions
    })
    return res.data.data
  },

  // Admin: Batch Lifecycle
  batchProcessPayroll: async (month: number, year: number) => {
    const res = await api.post<ApiResponse<PayrollResponse[]>>(`/payroll/batch/${month}/${year}`)
    return res.data.data
  },

  approveMonthlyPayroll: async (month: number, year: number) => {
    const res = await api.post<ApiResponse<string>>(`/payroll/batch/${month}/${year}/approve`)
    return res.data.data
  },

  lockMonthlyPayroll: async (month: number, year: number) => {
    const res = await api.post<ApiResponse<string>>(`/payroll/batch/${month}/${year}/lock`)
    return res.data.data
  },

  unlockMonthlyPayroll: async (month: number, year: number) => {
    const res = await api.post<ApiResponse<string>>(`/payroll/batch/${month}/${year}/unlock`)
    return res.data.data
  },

  getAuditLogs: async (month: number, year: number) => {
    const res = await api.get<ApiResponse<PayrollAuditLogResponse[]>>(`/payroll/audit/${month}/${year}`)
    return res.data.data
  },

  markAsPaid: async (payrollId: string) => {
    const res = await api.post<ApiResponse<PayrollResponse>>(`/payroll/${payrollId}/pay`)
    return res.data.data
  },

  reversePayroll: async (payrollId: string) => {
    const res = await api.post<ApiResponse<PayrollResponse>>(`/payroll/${payrollId}/reverse`)
    return res.data.data
  },

  // Admin: Export monthly report
  exportMonthlyReport: async (month: number, year: number, format: 'pdf' | 'excel' | 'csv' | 'bank-file') => {
    const res = await api.get(`/payroll/reports/export`, {
      params: { month, year, format },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    
    let fileName = `Payroll_Report_${format.toUpperCase()}.pdf`
    const disposition = res.headers['content-disposition']
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '')
      }
    } else {
      let ext: string = format
      if (format === 'excel') ext = 'xlsx'
      if (format === 'bank-file') ext = 'csv'
      fileName = `Payroll_Report_${month}_${year}.${ext}`
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Employee/Admin: Download payslip PDF
  downloadPayslip: async (payrollId: string) => {
    const res = await api.get(`/payroll/${payrollId}/payslip/download`, {
      responseType: 'blob' // Important for downloading files
    })
    
    // Create a download link for the blob
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Attempt to extract filename from content-disposition header if present
    let fileName = 'Payslip.pdf'
    const disposition = res.headers['content-disposition']
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '')
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Salary Structures
  getAllStructures: async () => {
    const res = await api.get<ApiResponse<SalaryStructureResponse[]>>('/payroll/structures')
    return res.data.data
  },

  createStructure: async (data: SalaryStructureRequest) => {
    const res = await api.post<ApiResponse<SalaryStructureResponse>>('/payroll/structures', data)
    return res.data.data
  },

  updateStructure: async (id: string, data: SalaryStructureRequest) => {
    const res = await api.put<ApiResponse<SalaryStructureResponse>>(`/payroll/structures/${id}`, data)
    return res.data.data
  },

  deleteStructure: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/payroll/structures/${id}`)
    return res.data
  }
}
