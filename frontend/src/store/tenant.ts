import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TenantConfig {
  id: string
  name: string
  domain: string
  logoUrl?: string
  theme: {
    primaryColor: string // e.g. #6366f1
    primaryGradientStart: string
    primaryGradientEnd: string
    radius: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  }
}

const defaultTenant: TenantConfig = {
  id: 'tenant_nexus',
  name: 'NexusHR',
  domain: 'nexushr.com',
  theme: {
    primaryColor: '#6366f1', // accent-indigo
    primaryGradientStart: '#6366f1',
    primaryGradientEnd: '#8b5cf6', // accent-violet
    radius: 'xl',
  }
}

interface TenantState {
  tenant: TenantConfig
  setTenant: (config: Partial<TenantConfig>) => void
  applyTheme: () => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenant: defaultTenant,
      
      setTenant: (config) => {
        set((state) => {
          const newTenant = { ...state.tenant, ...config }
          return { tenant: newTenant }
        })
        get().applyTheme()
      },

      applyTheme: () => {
        const { theme } = get().tenant
        const root = document.documentElement
        
        // In a real app, you'd calculate HSL/RGB values for Tailwind to use dynamically.
        // We set basic custom properties that our CSS can consume if needed.
        root.style.setProperty('--tenant-primary', theme.primaryColor)
        root.style.setProperty('--tenant-gradient-start', theme.primaryGradientStart)
        root.style.setProperty('--tenant-gradient-end', theme.primaryGradientEnd)
        
        // Map radius
        const radiusMap = {
          'sm': '6px',
          'md': '10px',
          'lg': '14px',
          'xl': '20px',
          '2xl': '28px'
        }
        root.style.setProperty('--radius-master', radiusMap[theme.radius])
      }
    }),
    {
      name: 'nexushr-tenant-storage'
    }
  )
)
