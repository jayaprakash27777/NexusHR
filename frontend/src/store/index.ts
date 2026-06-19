import { create } from 'zustand'
import { authApi, type AuthUser } from '@/api/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (user: AuthUser, token: string, refreshToken?: string) => void
  logout: () => Promise<void>
  setUser: (user: AuthUser) => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('nexushr_token'),
  isAuthenticated: !!localStorage.getItem('nexushr_token'),
  isInitialized: false,

  login: (user, token, refreshToken) => {
    localStorage.setItem('nexushr_token', token)
    if (refreshToken) localStorage.setItem('nexushr_refresh_token', refreshToken)
    set({ user, token, isAuthenticated: true, isInitialized: true })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Proceed with local logout even if server call fails
    }
    localStorage.removeItem('nexushr_token')
    localStorage.removeItem('nexushr_refresh_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user) => set({ user }),

  initializeAuth: async () => {
    const token = localStorage.getItem('nexushr_token')
    if (!token) {
      set({ isInitialized: true, isAuthenticated: false })
      return
    }
    try {
      const user = await authApi.getMe()
      set({ user, isAuthenticated: true, isInitialized: true })
    } catch {
      localStorage.removeItem('nexushr_token')
      localStorage.removeItem('nexushr_refresh_token')
      set({ user: null, token: null, isAuthenticated: false, isInitialized: true })
    }
  },
}))

// Listen for auth:logout events dispatched by the axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout()
  })
}

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: 'dark'
  commandPaletteOpen: boolean
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'dark',
  commandPaletteOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))

export * from './realtime'
export * from './chat'
