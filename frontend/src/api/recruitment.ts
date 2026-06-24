import api, { PagedResponse, ApiResponse } from './client'

export interface JobPosting {
  id: string
  title: string
  departmentId?: string
  departmentName?: string
  location: string
  status: string
  description: string
  requirements: string
  createdAt: string
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  resumeUrl: string
  internalEmployeeId?: string
  createdAt: string
}

export interface JobApplication {
  id: string
  candidateId: string
  candidate: Candidate
  jobPostingId: string
  jobPosting: JobPosting
  status: string
  notes?: string
  createdAt: string
}

export interface Interview {
  id: string
  applicationId: string
  application: JobApplication
  interviewerId?: string
  interviewerName?: string
  scheduledAt: string
  status: string
  feedback?: string
  rating?: number
  createdAt: string
}

export interface Offer {
  id: string
  candidateId: string
  candidate: Candidate
  jobPostingId: string
  jobPosting: JobPosting
  salary: number
  status: string
  fileUrl?: string
  notes?: string
  expiresAt?: string
  createdAt: string
}

export const recruitmentApi = {
  // Job Postings
  getJobs: async (page = 0, size = 50) => {
    const res = await api.get<PagedResponse<JobPosting>>('/recruitment/jobs', { params: { page, size } })
    return res.data
  },
  getJobById: async (id: string) => {
    const res = await api.get<ApiResponse<JobPosting>>(`/recruitment/jobs/${id}`)
    return res.data.data
  },
  createJob: async (data: Partial<JobPosting>) => {
    const res = await api.post<ApiResponse<JobPosting>>('/recruitment/jobs', data)
    return res.data.data
  },
  updateJob: async (id: string, data: Partial<JobPosting>) => {
    const res = await api.put<ApiResponse<JobPosting>>(`/recruitment/jobs/${id}`, data)
    return res.data.data
  },
  deleteJob: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/recruitment/jobs/${id}`)
    return res.data
  },

  // Candidates
  getCandidates: async (page = 0, size = 50) => {
    const res = await api.get<PagedResponse<Candidate>>('/recruitment/candidates', { params: { page, size } })
    return res.data
  },
  getCandidateById: async (id: string) => {
    const res = await api.get<ApiResponse<Candidate>>(`/recruitment/candidates/${id}`)
    return res.data.data
  },
  createCandidate: async (data: Partial<Candidate>) => {
    const res = await api.post<ApiResponse<Candidate>>('/recruitment/candidates', data)
    return res.data.data
  },
  updateCandidate: async (id: string, data: Partial<Candidate>) => {
    const res = await api.put<ApiResponse<Candidate>>(`/recruitment/candidates/${id}`, data)
    return res.data.data
  },
  uploadResume: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post<ApiResponse<Candidate>>(`/recruitment/candidates/${id}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data
  },

  // Applications
  getApplications: async (jobId: string) => {
    const res = await api.get<JobApplication[]>(`/recruitment/applications/job/${jobId}`)
    return res.data
  },
  createApplication: async (data: { candidateId: string, jobPostingId: string, notes?: string }) => {
    const res = await api.post<ApiResponse<JobApplication>>('/recruitment/applications', data)
    return res.data.data
  },
  updateApplicationStatus: async (appId: string, status: string) => {
    const res = await api.patch<ApiResponse<JobApplication>>(`/recruitment/applications/${appId}/status`, null, { params: { status } })
    return res.data.data
  },

  // Interviews
  getInterviewsByApplication: async (applicationId: string) => {
    const res = await api.get<Interview[]>(`/recruitment/interviews/application/${applicationId}`)
    return res.data
  },
  scheduleInterview: async (data: Partial<Interview>) => {
    const res = await api.post<ApiResponse<Interview>>('/recruitment/interviews', data)
    return res.data.data
  },
  submitInterviewFeedback: async (id: string, feedback: string, rating: number) => {
    const res = await api.patch<ApiResponse<Interview>>(`/recruitment/interviews/${id}/feedback`, null, { params: { feedback, rating } })
    return res.data.data
  },

  // Offers
  getOffersByCandidate: async (candidateId: string) => {
    const res = await api.get<Offer[]>(`/recruitment/offers/candidate/${candidateId}`)
    return res.data
  },
  getOffersByJobPosting: async (jobPostingId: string) => {
    const res = await api.get<Offer[]>(`/recruitment/offers/job/${jobPostingId}`)
    return res.data
  },
  createOffer: async (data: Partial<Offer>) => {
    const res = await api.post<ApiResponse<Offer>>('/recruitment/offers', data)
    return res.data.data
  },
  updateOfferStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Offer>>(`/recruitment/offers/${id}/status`, null, { params: { status } })
    return res.data.data
  },
  uploadOfferLetter: async (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post<ApiResponse<Offer>>(`/recruitment/offers/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.data
  }
}
