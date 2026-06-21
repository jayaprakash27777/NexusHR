import apiClient, { type ApiResponse, type PagedResponse } from './client'

export type ReviewStatus = 'PENDING_SELF' | 'PENDING_MANAGER' | 'COMPLETED' | 'DRAFT'
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type GoalCategory = 'PERFORMANCE' | 'LEARNING' | 'TEAMWORK' | 'INNOVATION' | 'LEADERSHIP'

export interface PerformanceGoal {
  id: string
  employeeId: string
  employeeName: string
  title: string
  description: string
  category: GoalCategory
  targetDate: string
  status: GoalStatus
  progressPercentage: number
  weightage: number
  createdAt: string
  updatedAt: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewerId: string
  reviewerName: string
  reviewPeriod: string
  periodStart: string
  periodEnd: string
  status: ReviewStatus
  selfRating?: number
  selfComments?: string
  managerRating?: number
  managerComments?: string
  overallRating?: number
  goals: { goalId: string; title: string; achievement: number; comments?: string }[]
  strengths?: string
  areasOfImprovement?: string
  completedAt?: string
  createdAt: string
}

export interface CreateGoalRequest {
  title: string
  description: string
  category: GoalCategory
  targetDate: string
  weightage: number
}

export interface SubmitSelfReviewRequest {
  reviewId: string
  selfRating: number
  selfComments: string
  goalAchievements: { goalId: string; achievement: number; comments?: string }[]
}

export interface SubmitManagerReviewRequest {
  reviewId: string
  managerRating: number
  managerComments: string
  strengths: string
  areasOfImprovement: string
  goalAchievements: { goalId: string; achievement: number; comments?: string }[]
}

export const performanceApi = {
  getReviews: async (params: { page?: number; size?: number; status?: string; employeeId?: string } = {}): Promise<PagedResponse<PerformanceReview>> => {
    const res = await apiClient.get<PagedResponse<PerformanceReview>>('/performance/reviews', { params })
    return res.data
  },

  getReview: async (id: string): Promise<PerformanceReview> => {
    const res = await apiClient.get<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}`)
    return res.data.data
  },

  getGoals: async (employeeId?: string): Promise<PerformanceGoal[]> => {
    const url = employeeId ? `/performance/goals/${employeeId}` : '/performance/goals/my'
    const res = await apiClient.get<ApiResponse<PerformanceGoal[]>>(url)
    return res.data.data
  },

  createGoal: async (data: CreateGoalRequest): Promise<PerformanceGoal> => {
    const res = await apiClient.post<ApiResponse<PerformanceGoal>>('/performance/goals', data)
    return res.data.data
  },

  updateGoal: async (id: string, data: Partial<CreateGoalRequest> & { status?: GoalStatus; progressPercentage?: number }): Promise<PerformanceGoal> => {
    const res = await apiClient.put<ApiResponse<PerformanceGoal>>(`/performance/goals/${id}`, data)
    return res.data.data
  },

  deleteGoal: async (id: string): Promise<void> => {
    await apiClient.delete(`/performance/goals/${id}`)
  },

  submitSelfReview: async (data: SubmitSelfReviewRequest): Promise<PerformanceReview> => {
    const res = await apiClient.post<ApiResponse<PerformanceReview>>('/performance/reviews/self', data)
    return res.data.data
  },

  submitManagerReview: async (data: SubmitManagerReviewRequest): Promise<PerformanceReview> => {
    const res = await apiClient.post<ApiResponse<PerformanceReview>>('/performance/reviews/manager', data)
    return res.data.data
  },

  getPerformanceTrend: async (employeeId?: string): Promise<{ month: string; averageScore: number }[]> => {
    const url = employeeId ? `/performance/trend/${employeeId}` : '/performance/trend'
    const res = await apiClient.get<ApiResponse<{ month: string; averageScore: number }[]>>(url)
    return res.data.data
  },
}
