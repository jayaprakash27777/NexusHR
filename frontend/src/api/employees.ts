import apiClient, { type ApiResponse, type PagedResponse } from './client'

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  designation: string
  departmentId: string
  departmentName: string
  managerId?: string
  managerName?: string
  dateOfJoining: string
  dateOfBirth?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_NOTICE' | 'TERMINATED'
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
  gender?: string
  address?: string
  emergencyContact?: string
  salary?: number
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface EmploymentHistory {
  id: number
  employeeId: string
  departmentId?: string
  departmentName?: string
  previousDesignation?: string
  newDesignation?: string
  effectiveDate: string
  changeReason?: string
}

export interface EmergencyContact {
  id: number
  employeeId: string
  name: string
  relationship: string
  phoneNumber: string
  email?: string
  isPrimary: boolean
}

export interface EmployeeDocument {
  id: number
  employeeId: string
  documentType: string
  fileName: string
  contentType?: string
  fileSize?: number
  uploadDate: string
}

export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  designation: string
  departmentId: string
  managerId?: string
  dateOfJoining: string
  dateOfBirth?: string
  employmentType: string
  gender?: string
  salary?: number
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: string
}

export interface EmployeeQueryParams {
  page?: number
  size?: number
  search?: string
  department?: string
  status?: string
  employmentType?: string
  sort?: string
}

export const employeesApi = {
  getAll: async (params: EmployeeQueryParams = {}): Promise<PagedResponse<Employee>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Employee>>>('/employees', { params })
    return res.data.data
  },

  getById: async (id: string): Promise<Employee> => {
    const res = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`)
    return res.data.data
  },

  create: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const res = await apiClient.post<ApiResponse<Employee>>('/employees', data)
    return res.data.data
  },

  update: async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
    const res = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, data)
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`)
  },

  export: async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    const res = await apiClient.get(`/employees/export?format=${format}`, { responseType: 'blob' })
    return res.data
  },

  getDepartments: async (): Promise<{ id: string; name: string; headCount: number }[]> => {
    const res = await apiClient.get<ApiResponse<{ id: string; name: string; headCount: number }[]>>('/departments')
    return res.data.data
  },

  getHistory: async (id: string): Promise<EmploymentHistory[]> => {
    const res = await apiClient.get<ApiResponse<EmploymentHistory[]>>(`/employees/${id}/history`)
    return res.data.data
  },

  addHistory: async (id: string, data: Omit<EmploymentHistory, 'id' | 'employeeId'>): Promise<EmploymentHistory> => {
    const res = await apiClient.post<ApiResponse<EmploymentHistory>>(`/employees/${id}/history`, data)
    return res.data.data
  },

  getContacts: async (id: string): Promise<EmergencyContact[]> => {
    const res = await apiClient.get<ApiResponse<EmergencyContact[]>>(`/employees/${id}/contacts`)
    return res.data.data
  },

  addContact: async (id: string, data: Omit<EmergencyContact, 'id' | 'employeeId'>): Promise<EmergencyContact> => {
    const res = await apiClient.post<ApiResponse<EmergencyContact>>(`/employees/${id}/contacts`, data)
    return res.data.data
  },

  getDocuments: async (id: string): Promise<EmployeeDocument[]> => {
    const res = await apiClient.get<ApiResponse<EmployeeDocument[]>>(`/employees/${id}/documents`)
    return res.data.data
  },

  uploadDocument: async (id: string, documentType: string, file: File): Promise<EmployeeDocument> => {
    const formData = new FormData()
    formData.append('documentType', documentType)
    formData.append('file', file)
    
    const res = await apiClient.post<ApiResponse<EmployeeDocument>>(`/employees/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },

  downloadDocument: async (id: string, documentId: number): Promise<Blob> => {
    const res = await apiClient.get(`/employees/${id}/documents/${documentId}/download`, { responseType: 'blob' })
    return res.data
  }
}
