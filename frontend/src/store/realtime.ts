import { create } from 'zustand'
import { Client, type IFrame } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { QueryClient } from '@tanstack/react-query'

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'

export interface ActivityEvent {
  id: string
  type: 'CHECK_IN' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'PAYROLL_GENERATED' | 'REVIEW_COMPLETED' | 'ONBOARDING' | 'PROMOTION' | 'EMPLOYEE_CREATED'
  user: string
  avatar?: string
  message: string
  timestamp: string
  metadata?: Record<string, any>
}

const WS_URL = 'https://nexushr-fxe4.onrender.com/api/ws'

interface RealtimeState {
  status: ConnectionStatus
  client: Client | null
  activityStream: ActivityEvent[]
  queryClient: QueryClient | null
  setQueryClient: (qc: QueryClient) => void
  connect: (token: string) => void
  disconnect: () => void
  addActivity: (activity: ActivityEvent) => void
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  status: 'DISCONNECTED',
  client: null,
  activityStream: [],
  queryClient: null,

  setQueryClient: (qc: QueryClient) => set({ queryClient: qc }),

  connect: (token: string) => {
    if (get().status === 'CONNECTING' || get().status === 'CONNECTED') return

    set({ status: 'CONNECTING' })

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    client.onConnect = (_frame: IFrame) => {
      set({ status: 'CONNECTED', client })

      const qc = get().queryClient

      // Subscribe to live activity feed
      client.subscribe('/topic/activity', (msg) => {
        if (msg.body) {
          try {
            const event = JSON.parse(msg.body) as ActivityEvent
            get().addActivity(event)
          } catch { /* ignore */ }
        }
      })

      // Subscribe to employee changes — invalidate employee queries
      client.subscribe('/topic/employees', () => {
        qc?.invalidateQueries({ queryKey: ['employees'] })
        qc?.invalidateQueries({ queryKey: ['dashboard'] })
      })

      // Subscribe to attendance changes
      client.subscribe('/topic/attendance', () => {
        qc?.invalidateQueries({ queryKey: ['attendance'] })
        qc?.invalidateQueries({ queryKey: ['dashboard'] })
      })

      // Subscribe to leave changes — invalidates approvals, balances
      client.subscribe('/topic/leaves', () => {
        qc?.invalidateQueries({ queryKey: ['leaves'] })
        qc?.invalidateQueries({ queryKey: ['leave-balance'] })
        qc?.invalidateQueries({ queryKey: ['dashboard'] })
      })

      // Subscribe to payroll events
      client.subscribe('/topic/payroll', () => {
        qc?.invalidateQueries({ queryKey: ['payroll'] })
        qc?.invalidateQueries({ queryKey: ['dashboard'] })
      })

      // Subscribe to notifications — update unread count in real-time
      client.subscribe('/user/queue/notifications', (msg) => {
        qc?.invalidateQueries({ queryKey: ['notifications'] })
        qc?.invalidateQueries({ queryKey: ['notifications-count'] })
        if (msg.body) {
          try {
            const event = JSON.parse(msg.body) as ActivityEvent
            get().addActivity(event)
          } catch { /* ignore */ }
        }
      })

      // Subscribe to performance events
      client.subscribe('/topic/performance', () => {
        qc?.invalidateQueries({ queryKey: ['reviews'] })
        qc?.invalidateQueries({ queryKey: ['goals'] })
      })
    }

    client.onStompError = (_frame: IFrame) => {
      set({ status: 'ERROR' })
    }

    client.onWebSocketClose = () => {
      set({ status: 'RECONNECTING' })
    }

    client.onDisconnect = () => {
      set({ status: 'DISCONNECTED' })
    }

    client.activate()
    set({ client })
  },

  disconnect: () => {
    const { client } = get()
    if (client?.active) {
      client.deactivate()
    }
    set({ status: 'DISCONNECTED', client: null })
  },

  addActivity: (activity: ActivityEvent) => {
    set((state) => ({
      activityStream: [activity, ...state.activityStream].slice(0, 100),
    }))
  },
}))
