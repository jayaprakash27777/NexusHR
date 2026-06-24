import apiClient from './client'

export interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  fileSize: number
  category: string
  status: string
  ownerId?: string
  uploadedBy?: string
  createdAt: string
  updatedAt: string
}

export const documentApi = {
  getAll: async () => {
    const response = await apiClient.get<{ data: Document[] }>('/documents')
    return response.data.data
  },

  getByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get<{ data: Document[] }>(`/documents/employee/${employeeId}`)
    return response.data.data
  },

  upload: async (file: File, title: string, category: string, ownerId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('category', category)
    if (ownerId) {
      formData.append('ownerId', ownerId)
    }

    const response = await apiClient.post<{ data: Document }>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ data: null }>(`/documents/${id}`)
    return response.data.data
  },

  getDownloadUrl: (id: string) => {
    return `${apiClient.defaults.baseURL}/documents/${id}/download`
  },

  getPreviewUrl: (id: string) => {
    return `${apiClient.defaults.baseURL}/documents/${id}/preview`
  }
}
