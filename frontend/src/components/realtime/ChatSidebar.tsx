import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore, useAuthStore } from '@/store'
import { X, Search, Send, Phone, Video, Check, CheckCheck, Paperclip, FileText, Download, Plus } from 'lucide-react'
import PresenceBadge from './PresenceBadge'
import CreateChannelModal from './CreateChannelModal'

const API_BASE = 'https://nexushr-fxe4.onrender.com'

export default function ChatSidebar() {
  const { 
    chatSidebarOpen, toggleChatSidebar, 
    conversations, messages, presenceMap, typingUsers,
    activeChannel, setActiveChannel, 
    sendMessage, connect, disconnect,
    fetchConversations, fetchMessages, sendTypingEvent, uploadAttachment,
    searchChat, searchResults, isSearching, clearSearch, editMessage, deleteMessage, toggleReaction,
    currentPages, hasMore
  } = useChatStore()
  
  const { user, token } = useAuthStore()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [reactionPopoverId, setReactionPopoverId] = useState<string | null>(null)
  
  const REACTIONS = ['👍', '❤️', '🎉', '👏', '😄']

  useEffect(() => {
    if (chatSidebarOpen && token && user) {
      connect(token, user.id)
    }
  }, [chatSidebarOpen, token, user, connect])

  useEffect(() => {
    if (activeChannel && token) {
      fetchMessages(token, activeChannel)
    }
  }, [activeChannel, token, fetchMessages])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeChannel])

  const activeConversation = activeChannel ? conversations.find(c => c.id === activeChannel) : null
  const currentMessages = activeChannel ? (messages[activeChannel] || []) : []
  
  const getOtherParticipant = (convo: any) => {
    if (convo?.type === 'PRIVATE' && user) {
      return convo.participants.find((p: any) => p.userId !== user.id)
    }
    return null
  }

  const activeParticipant = getOtherParticipant(activeConversation)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChannel || !user) return
    sendMessage(activeChannel, inputText)
    setInputText('')
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    sendTypingEvent(activeChannel, false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    if (!activeChannel) return

    if (e.target.value.trim() !== '') {
      sendTypingEvent(activeChannel, true)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingEvent(activeChannel, false)
      }, 3000)
    } else {
      sendTypingEvent(activeChannel, false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeChannel) return
    
    setIsUploading(true)
    await uploadAttachment(activeChannel, file)
    setIsUploading(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderStatus = (msg: any) => {
    if (activeConversation?.type === 'TEAM') {
      const delivered = msg.deliveredCount || 0
      const read = msg.readCount || 0
      
      if (delivered === 0 && read === 0) {
        return <Check className="h-3 w-3 text-nexus-400" />
      }
      
      return (
        <div className="flex items-center gap-1.5 ml-2">
          <div className="flex items-center gap-0.5 text-[9px] text-nexus-400">
            <CheckCheck className="h-3 w-3" /> {delivered}
          </div>
          {read > 0 && (
            <div className="flex items-center gap-0.5 text-[9px] text-blue-400">
              <CheckCheck className="h-3 w-3" /> {read}
            </div>
          )}
        </div>
      )
    }

    // PRIVATE
    if (msg.status === 'SENT') return <Check className="h-3 w-3 text-nexus-400 ml-1" />
    if (msg.status === 'DELIVERED') return <CheckCheck className="h-3 w-3 text-nexus-400 ml-1" />
    if (msg.status === 'READ' || (msg.readCount && msg.readCount > 0)) return <CheckCheck className="h-3 w-3 text-blue-400 ml-1" />
    return null
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (val.trim() === '') {
      clearSearch()
    } else {
      searchTimeoutRef.current = setTimeout(() => {
        searchChat(val)
      }, 500)
    }
  }

  return (
    <AnimatePresence>
      {chatSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleChatSidebar}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-border bg-background/90 backdrop-blur-2xl sm:w-[400px]"
          >
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Messages</h2>
              <button
                onClick={toggleChatSidebar}
                className="rounded-full p-1.5 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {!activeChannel ? (
                  <motion.div
                    key="conversations"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-1 flex-col"
                  >
                    <div className="p-4 flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Search conversations, files..."
                          className="w-full rounded-xl border border-border/50 bg-foreground/5 py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-accent-indigo/50 focus:bg-foreground/10"
                        />
                      </div>
                      <button 
                        onClick={() => setIsCreateChannelOpen(true)}
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-accent-indigo text-white hover:bg-accent-indigo/90 transition-colors"
                        title="Create Channel"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-4">
                      {searchResults ? (
                        <div className="space-y-4 px-2">
                          {isSearching && <div className="text-xs text-nexus-400">Searching...</div>}
                          
                          {searchResults.users && searchResults.users.content.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Users</h4>
                              {searchResults.users.content.map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer">
                                  <div className="w-8 h-8 rounded-full bg-accent-indigo/20 flex items-center justify-center text-xs text-foreground">
                                    {u.fullName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-sm text-foreground">{u.fullName}</div>
                                    <div className="text-xs text-muted">{u.email}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {searchResults.channels && searchResults.channels.content.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Channels</h4>
                              {searchResults.channels.content.map(c => (
                                <button key={c.id} onClick={() => setActiveChannel(c.id)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 text-left">
                                  <div className="w-8 h-8 rounded-full bg-accent-violet/20 flex items-center justify-center text-xs text-foreground">
                                    #
                                  </div>
                                  <div className="text-sm text-foreground">{c.name}</div>
                                </button>
                              ))}
                            </div>
                          )}

                          {searchResults.files && searchResults.files.content.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Files</h4>
                              {searchResults.files.content.map(f => (
                                <a key={f.id} href={`${API_BASE}${f.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5">
                                  <FileText className="h-5 w-5 text-accent-indigo" />
                                  <div className="overflow-hidden flex-1">
                                    <div className="text-sm text-foreground truncate">{f.fileName}</div>
                                    <div className="text-xs text-muted">{(f.fileSize || 0) / 1024} KB</div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {conversations.length === 0 && (
                            <div className="text-center text-sm text-muted mt-10">No active conversations.</div>
                          )}
                          {conversations.map((convo) => {
                            const otherP = getOtherParticipant(convo)
                            const name = convo.type === 'PRIVATE' ? otherP?.userName : convo.name
                            const initials = name?.substring(0, 2).toUpperCase() || 'CH'
                            return (
                              <button
                                key={convo.id}
                                onClick={() => setActiveChannel(convo.id)}
                                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-foreground/5"
                              >
                                <div className="relative">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 text-sm font-bold text-foreground ring-2 ring-background">
                                    {initials}
                                  </div>
                                  {convo.type === 'PRIVATE' && (
                                    <div className="absolute bottom-0 right-0 ring-2 ring-background rounded-full bg-background">
                                      <PresenceBadge status={otherP?.userId && presenceMap[otherP.userId] ? presenceMap[otherP.userId].status : 'OFFLINE'} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <h3 className="truncate text-sm font-semibold text-foreground">{name}</h3>
                                  <p className="truncate text-xs text-muted">
                                    {convo.lastMessage ? convo.lastMessage.content : 'No messages yet'}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat-room"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-1 flex-col bg-surface/50"
                  >
                    <div className="flex items-center gap-3 border-b border-border/50 bg-background/50 p-4 backdrop-blur-md">
                      <button
                        onClick={() => setActiveChannel(null)}
                        className="rounded-full p-1.5 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 text-xs font-bold text-foreground">
                            {activeConversation?.type === 'PRIVATE' ? activeParticipant?.userName?.substring(0, 2).toUpperCase() : activeConversation?.name?.substring(0, 2).toUpperCase()}
                          </div>
                          {activeConversation?.type === 'PRIVATE' && (
                            <div className="absolute bottom-0 right-0 ring-2 ring-background rounded-full bg-background">
                              <PresenceBadge status={activeParticipant?.userId && presenceMap[activeParticipant.userId] ? presenceMap[activeParticipant.userId].status : 'OFFLINE'} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {activeConversation?.type === 'PRIVATE' ? activeParticipant?.userName : activeConversation?.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div 
                      ref={scrollContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4"
                      onScroll={(e) => {
                        const target = e.target as HTMLDivElement
                        if (target.scrollTop === 0 && activeChannel && hasMore[activeChannel]) {
                          const prevScrollHeight = target.scrollHeight
                          fetchMessages(token!, activeChannel, (currentPages[activeChannel] || 0) + 1).then(() => {
                            // Maintain scroll position after prepending
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - prevScrollHeight
                            }
                          })
                        }
                      }}
                    >
                      {currentMessages.map((msg) => {
                        const isMe = msg.senderId === user?.id
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 20, rotateX: isMe ? -15 : 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            style={{ perspective: 1000 }}
                          >
                            <div
                              className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-transform duration-300 hover:scale-[1.02] ${
                                isMe
                                  ? 'bg-accent-indigo text-white rounded-br-sm'
                                  : 'bg-foreground/10 text-foreground rounded-bl-sm'
                              }`}
                            >
                                {!isMe && activeConversation?.type === 'TEAM' && (
                                  <div className="text-[10px] font-bold text-muted mb-1">{msg.senderName}</div>
                                )}
                                
                                {msg.isDeleted ? (
                                    <div className="flex items-center gap-2 italic opacity-50">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
                                      This message was deleted
                                    </div>
                                  ) : msg.messageType === 'IMAGE' && msg.fileUrl ? (
                                    <img src={`${API_BASE}${msg.fileUrl}`} alt="Attachment" className="max-w-full rounded-lg mb-1" />
                                  ) : msg.messageType === 'FILE' && msg.fileUrl ? (
                                  <a 
                                    href={`${API_BASE}${msg.fileUrl}`}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors mb-1"
                                  >
                                    <FileText className="h-6 w-6 text-accent-indigo" />
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-sm font-medium truncate">{msg.fileName}</p>
                                      <p className="text-xs text-muted">{Math.round((msg.fileSize || 0) / 1024)} KB</p>
                                    </div>
                                    <Download className="h-4 w-4 text-secondary" />
                                  </a>
                                ) : editingMessageId === msg.id ? (
                                  <div className="flex flex-col gap-2">
                                    <input 
                                      autoFocus
                                      type="text" 
                                      value={editContent} 
                                      onChange={(e) => setEditContent(e.target.value)} 
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          editMessage(msg.id, editContent)
                                          setEditingMessageId(null)
                                        } else if (e.key === 'Escape') {
                                          setEditingMessageId(null)
                                        }
                                      }}
                                      className="text-black px-2 py-1 rounded" 
                                    />
                                    <span className="text-[10px] opacity-70">Press Enter to save, Esc to cancel</span>
                                  </div>
                                ) : (
                                  <>
                                    {msg.content}
                                    {!msg.isDeleted && (
                                      <div className={`absolute ${isMe ? '-left-20' : '-right-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all z-10`}>
                                        <div className="relative">
                                          <button 
                                            onClick={() => setReactionPopoverId(reactionPopoverId === msg.id ? null : msg.id)}
                                            className="p-1 text-muted hover:text-yellow-400 bg-foreground/10 rounded"
                                            title="React"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                          </button>
                                          {reactionPopoverId === msg.id && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background/80 backdrop-blur rounded-full px-2 py-1 flex gap-1 shadow-xl border border-border">
                                              {REACTIONS.map(r => (
                                                <button 
                                                  key={r} 
                                                  onClick={() => {
                                                    toggleReaction(msg.id, r)
                                                    setReactionPopoverId(null)
                                                  }}
                                                  className="hover:scale-125 transition-transform"
                                                >
                                                  {r}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        {isMe && msg.messageType === 'TEXT' && (
                                          <>
                                            <button 
                                              onClick={() => {
                                                setEditingMessageId(msg.id)
                                                setEditContent(msg.content)
                                              }}
                                              className="p-1 text-muted hover:text-foreground bg-foreground/10 rounded"
                                              title="Edit message"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                            </button>
                                            <button 
                                              onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this message?')) {
                                                  deleteMessage(msg.id)
                                                }
                                              }}
                                              className="p-1 text-muted hover:text-danger bg-foreground/10 rounded"
                                              title="Delete message"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  {Object.entries(msg.reactions).map(([reaction, users]) => (
                                    <button
                                      key={reaction}
                                      onClick={() => toggleReaction(msg.id, reaction)}
                                      className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                                        user && users.includes(user.fullName) ? 'bg-accent-indigo text-white' : 'bg-foreground/10 text-secondary'
                                      }`}
                                      title={users.join(', ')}
                                    >
                                      <span>{reaction}</span>
                                      <span>{users.length}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <span className="mt-1 flex items-center gap-1 text-[9px] text-muted">
                                {msg.isEdited && <span className="italic mr-1">(edited)</span>}
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMe && renderStatus(msg)}
                              </span>
                          </motion.div>
                        )
                      })}
                      
                      {/* Typing Indicators */}
                      {activeChannel && typingUsers[activeChannel] && typingUsers[activeChannel].length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-xs text-muted italic"
                        >
                          <div className="flex space-x-1 items-center">
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          {typingUsers[activeChannel].length === 1 
                            ? `${typingUsers[activeChannel][0].userName} is typing...`
                            : `${typingUsers[activeChannel].length} people are typing...`}
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-border/50 bg-background/50 p-4">
                      <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                          type="text"
                          value={inputText}
                          onChange={handleInputChange}
                          placeholder="Type a message..."
                          className="w-full rounded-full border border-border/50 bg-foreground/5 py-2.5 pl-11 pr-12 text-sm text-foreground placeholder-muted outline-none focus:border-accent-indigo/50 focus:bg-foreground/10"
                        />
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute left-2.5 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-foreground/10 hover:text-foreground transition-colors"
                        >
                          {isUploading ? (
                            <span className="w-3 h-3 border-2 border-muted border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Paperclip className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="submit"
                          disabled={!inputText.trim()}
                          className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent-indigo text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          <Send className="h-3.5 w-3.5 -ml-0.5" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <CreateChannelModal 
              isOpen={isCreateChannelOpen} 
              onClose={() => setIsCreateChannelOpen(false)} 
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
