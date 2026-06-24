import { create } from 'zustand'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE = import.meta.env.VITE_API_URL || 'https://nexushr-fxe4.onrender.com/api'

export type PresenceStatus = 'ONLINE' | 'AWAY' | 'OFFLINE' | 'MEETING'

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  status: PresenceStatus
  role?: string
}

export interface ConversationParticipantDto {
  id: string
  userId: string
  userName: string
  avatarUrl?: string
  joinedAt: string
}

export interface ChatMessageDto {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  messageType: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  deliveredCount?: number
  readCount?: number
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  isEdited?: boolean
  editedAt?: string
  isDeleted?: boolean
  deletedAt?: string
  reactions?: Record<string, string[]>
  createdAt: string
  updatedAt: string
}

export interface MessageReceiptUpdateDto {
  conversationId: string
  messageId: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  deliveredCount: number
  readCount: number
}

export interface ConversationDto {
  id: string
  name?: string
  type: 'PRIVATE' | 'TEAM'
  participants: ConversationParticipantDto[]
  lastMessage?: ChatMessageDto
  createdAt: string
  updatedAt: string
}

export interface TypingBroadcastDto {
  conversationId: string
  userId: string
  userName: string
  isTyping: boolean
}

export interface ChatSearchResponseDto {
  users?: { content: any[] }
  channels?: { content: ConversationDto[] }
  files?: { content: ChatMessageDto[] }
}

interface ChatState {
  chatSidebarOpen: boolean
  searchResults: ChatSearchResponseDto | null
  isSearching: boolean
  
  // Actions
  toggleChatSidebar: () => void
  searchChat: (query: string, filter?: string) => Promise<void>
  clearSearch: () => void
  createChannel: (name: string, type: string) => Promise<void>
  joinChannel: (channelId: string) => Promise<void>
  leaveChannel: (channelId: string) => Promise<void>
  inviteUserToChannel: (channelId: string, userId: string) => Promise<void>
  removeMemberFromChannel: (channelId: string, userId: string) => Promise<void>
  promoteMemberToAdmin: (channelId: string, userId: string) => Promise<void>
  activeChannel: string | null
  setActiveChannel: (channelId: string | null) => void
  
  myStatus: PresenceStatus
  setMyStatus: (status: PresenceStatus) => void
  
  // Maps userId -> PresenceStatus
  presenceMap: Record<string, { status: PresenceStatus, lastSeenAt?: string }>
  
  // Maps conversationId -> array of typing users
  typingUsers: Record<string, { userId: string, userName: string, timeoutId: ReturnType<typeof setTimeout> }[]>

  currentPages: Record<string, number>
  hasMore: Record<string, boolean>

  conversations: ConversationDto[]
  messages: Record<string, ChatMessageDto[]> // conversationId -> messages
  
  stompClient: Client | null
  idleTimer: ReturnType<typeof setTimeout> | null
  
  connect: (token: string, currentUserId: string) => void
  disconnect: () => void
  fetchConversations: (token: string) => Promise<void>
  fetchMessages: (token: string, conversationId: string, page?: number) => Promise<void>
  sendMessage: (conversationId: string, text: string) => void
  uploadAttachment: (conversationId: string, file: File) => Promise<void>
  acknowledgeMessage: (messageId: string, status: 'DELIVERED' | 'READ') => void
  startPrivateChat: (token: string, targetUserId: string) => Promise<ConversationDto>
  updatePresence: (status: PresenceStatus) => void
  resetIdleTimer: () => void
  sendTypingEvent: (conversationId: string, isTyping: boolean) => void
  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (messageId: string) => void
  toggleReaction: (messageId: string, reaction: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatSidebarOpen: false,
  presenceMap: {},
  typingUsers: {},
  searchResults: null,
  isSearching: false,
  currentPages: {},
  hasMore: {},

  toggleChatSidebar: () => set((state) => ({ chatSidebarOpen: !state.chatSidebarOpen })),

  clearSearch: () => set({ searchResults: null, isSearching: false }),

  searchChat: async (query: string, filter = 'ALL') => {
    if (!query.trim()) {
      get().clearSearch()
      return
    }
    
    set({ isSearching: true })
    try {
      const response = await fetch(`${API_BASE}/api/v1/chat/search?q=${encodeURIComponent(query)}&filter=${filter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        set({ searchResults: data })
      }
    } catch (e) {
      console.error('Failed to search chat:', e)
    } finally {
      set({ isSearching: false })
    }
  },

  createChannel: async (name: string, type: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/channels?name=${encodeURIComponent(name)}&type=${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      get().fetchConversations(localStorage.getItem('token')!)
    } catch (e) {
      console.error(e)
    }
  },

  joinChannel: async (channelId: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/channels/${channelId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      get().fetchConversations(localStorage.getItem('token')!)
    } catch (e) {
      console.error(e)
    }
  },

  leaveChannel: async (channelId: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/channels/${channelId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      get().setActiveChannel(null)
      get().fetchConversations(localStorage.getItem('token')!)
    } catch (e) {
      console.error(e)
    }
  },

  inviteUserToChannel: async (channelId: string, userId: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/channels/${channelId}/invite?targetUserId=${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } catch (e) {
      console.error(e)
    }
  },

  removeMemberFromChannel: async (channelId: string, userId: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/channels/${channelId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } catch (e) {
      console.error(e)
    }
  },

  promoteMemberToAdmin: async (channelId: string, userId: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/channels/${channelId}/members/${userId}/role?role=ADMIN`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } catch (e) {
      console.error(e)
    }
  },
  
  activeChannel: null,
  setActiveChannel: (id) => set({ activeChannel: id }),
  
  myStatus: 'ONLINE',
  setMyStatus: (status) => set({ myStatus: status }),
  

  conversations: [],
  messages: {},
  stompClient: null,
  idleTimer: null,
  
  connect: (token: string, currentUserId: string) => {
    if (get().stompClient) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        // console.log(str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    })

    client.onConnect = () => {
      // Subscribe to global presence updates
      client.subscribe('/topic/presence', (message) => {
        const dto = JSON.parse(message.body)
        set((state) => ({
          presenceMap: {
            ...state.presenceMap,
            [dto.userId]: { status: dto.status, lastSeenAt: dto.lastSeenAt }
          }
        }))
      })

      // Once connected, fetch conversations
      get().fetchConversations(token).then(() => {
        const convos = get().conversations
        // Subscribe to all conversations the user is part of
        convos.forEach(c => {
          client.subscribe(`/topic/conversations.${c.id}`, (message) => {
            const dto: ChatMessageDto = JSON.parse(message.body)
            set((state) => {
              const prev = state.messages[c.id] || []
              // replace if it's an ack, else append
              const exists = prev.findIndex(m => m.id === dto.id)
              let nextMessages
              if (exists >= 0) {
                nextMessages = [...prev]
                nextMessages[exists] = dto
              } else {
                nextMessages = [dto, ...prev].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                
                // If it's a new message and we didn't send it, acknowledge it.
                // For PRIVATE, acknowledge READ if chat is open, otherwise DELIVERED.
                // For TEAM, acknowledge DELIVERED only if it is still SENT.
                // We always ACK READ if the chat is actively open.
                if (dto.senderId !== currentUserId) {
                  const isActiveAndOpen = state.activeChannel === c.id && state.chatSidebarOpen
                  
                  if (c.type === 'PRIVATE') {
                    get().acknowledgeMessage(dto.id, isActiveAndOpen ? 'READ' : 'DELIVERED')
                  } else if (c.type === 'TEAM') {
                    if (isActiveAndOpen) {
                      get().acknowledgeMessage(dto.id, 'READ')
                    } else if (dto.status === 'SENT') {
                      get().acknowledgeMessage(dto.id, 'DELIVERED')
                    }
                  }
                }
              }
              return { messages: { ...state.messages, [c.id]: nextMessages } }
            })
          })

          // Subscribe to typing events
          client.subscribe(`/topic/conversations.${c.id}.typing`, (message) => {
            const dto: TypingBroadcastDto = JSON.parse(message.body)
            if (dto.userId === currentUserId) return // Ignore own typing events

            set((state) => {
              const prev = state.typingUsers[c.id] || []
              const existingIndex = prev.findIndex(u => u.userId === dto.userId)
              
              if (existingIndex >= 0) {
                clearTimeout(prev[existingIndex].timeoutId)
              }

              let next = [...prev]
              if (dto.isTyping) {
                const timeoutId = setTimeout(() => {
                  set((s) => ({
                    typingUsers: {
                      ...s.typingUsers,
                      [c.id]: (s.typingUsers[c.id] || []).filter(u => u.userId !== dto.userId)
                    }
                  }))
                }, 3000)

                if (existingIndex >= 0) {
                  next[existingIndex] = { ...next[existingIndex], timeoutId }
                } else {
                  next.push({ userId: dto.userId, userName: dto.userName, timeoutId })
                }
              } else {
                next = next.filter(u => u.userId !== dto.userId)
              }

              return { typingUsers: { ...state.typingUsers, [c.id]: next } }
            })
          })

          // Subscribe to message receipt updates
          client.subscribe(`/topic/conversations.${c.id}.receipts`, (message) => {
            const dto: MessageReceiptUpdateDto = JSON.parse(message.body)
            set((state) => {
              const prev = state.messages[c.id] || []
              const existingIndex = prev.findIndex(m => m.id === dto.messageId)
              
              if (existingIndex >= 0) {
                const nextMessages = [...prev]
                nextMessages[existingIndex] = {
                  ...nextMessages[existingIndex],
                  status: dto.status,
                  deliveredCount: dto.deliveredCount,
                  readCount: dto.readCount
                }
                return { messages: { ...state.messages, [c.id]: nextMessages } }
              }
              return state
            })
          })
        })
      })

      // Set up idle tracking
      get().resetIdleTimer()
      window.addEventListener('mousemove', get().resetIdleTimer)
      window.addEventListener('keydown', get().resetIdleTimer)
    }

    client.activate()
    set({ stompClient: client })
  },

  disconnect: () => {
    const { stompClient, idleTimer } = get()
    if (idleTimer) clearTimeout(idleTimer)
    window.removeEventListener('mousemove', get().resetIdleTimer)
    window.removeEventListener('keydown', get().resetIdleTimer)
    
    if (stompClient) {
      stompClient.deactivate()
      set({ stompClient: null, idleTimer: null })
    }
  },

  fetchConversations: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch conversations')
      const data = await res.json()
      set({ conversations: data.content || [] })
    } catch (e) {
      console.error(e)
    }
  },

  fetchMessages: async (token: string, conversationId: string, page: number = 0) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/conversations/${conversationId}/messages?page=${page}&size=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      
      set((state) => {
        const newMessages = (data.content || []).reverse()
        const existingMessages = state.messages[conversationId] || []
        
        return {
          messages: {
            ...state.messages,
            [conversationId]: page === 0 ? newMessages : [...newMessages, ...existingMessages]
          },
          currentPages: {
            ...state.currentPages,
            [conversationId]: page
          },
          hasMore: {
            ...state.hasMore,
            [conversationId]: !data.last
          }
        }
      })
    } catch (e) {
      console.error(e)
    }
  },

  sendMessage: (conversationId: string, text: string) => {
    const { stompClient } = get()
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({ conversationId, content: text })
      })
    }
  },

  uploadAttachment: async (conversationId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', conversationId)

      await fetch(`${API_BASE}/api/v1/chat/attachments`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (e) {
      console.error(e)
    }
  },

  acknowledgeMessage: (messageId: string, status: 'DELIVERED' | 'READ') => {
    const { stompClient } = get()
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.acknowledge',
        body: JSON.stringify({ messageId, status })
      })
    }
  },

  startPrivateChat: async (token: string, targetUserId: string) => {
    const res = await fetch(`${API_BASE}/api/v1/chat/conversations/private?targetUserId=${targetUserId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to create private chat')
    const dto: ConversationDto = await res.json()
    set((state) => ({
      conversations: [...state.conversations.filter(c => c.id !== dto.id), dto]
    }))
    return dto
  },

  updatePresence: (status: PresenceStatus) => {
    const { stompClient, myStatus } = get()
    if (myStatus === status) return
    
    set({ myStatus: status })
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/presence',
        body: JSON.stringify({ status })
      })
    }
  },

  resetIdleTimer: () => {
    const { idleTimer, updatePresence } = get()
    if (idleTimer) clearTimeout(idleTimer)
    
    // If we were AWAY, mark ONLINE again
    if (get().myStatus === 'AWAY') {
      updatePresence('ONLINE')
    }

    const timer = setTimeout(() => {
      updatePresence('AWAY')
    }, 5 * 60 * 1000) // 5 minutes idle
    
    set({ idleTimer: timer })
  },

  sendTypingEvent: (conversationId: string, isTyping: boolean) => {
    const { stompClient } = get()
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({ conversationId, isTyping })
      })
    }
  },

  editMessage: (messageId: string, newContent: string) => {
    const { stompClient } = get()
    if (stompClient?.connected) {
      stompClient.publish({
        destination: '/app/chat.editMessage',
        body: JSON.stringify({ messageId, newContent })
      })
    }
  },

  deleteMessage: (messageId: string) => {
    const { stompClient } = get()
    if (stompClient?.connected) {
      stompClient.publish({
        destination: '/app/chat.deleteMessage',
        body: JSON.stringify({ messageId })
      })
    }
  },

  toggleReaction: (messageId: string, reaction: string) => {
    const { stompClient } = get()
    if (stompClient?.connected) {
      stompClient.publish({
        destination: '/app/chat.react',
        body: JSON.stringify({ messageId, reaction })
      })
    }
  }
}))
