import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsApi, AnnouncementType, CreateAnnouncementRequest, AnnouncementDto } from '@/api/announcements'
import { useAuthStore } from '@/store'
import GlassCard from './GlassCard'
import { Bell, ThumbsUp, Send, Loader2, Megaphone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AnnouncementsWidget() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<AnnouncementType>('GLOBAL')

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.getAnnouncements(0, 10),
  })

  const reactMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.reactToAnnouncement(id, 'ACKNOWLEDGE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => announcementsApi.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setIsCreating(false)
      setNewTitle('')
      setNewContent('')
    }
  })

  const userRole = user?.role || ''
  const canCreateGlobal = userRole === 'ROLE_SUPER_ADMIN' || userRole === 'ROLE_ADMIN' || userRole === 'ROLE_HR_DIRECTOR'
  const canCreateHR = userRole === 'ROLE_HR_DIRECTOR' || userRole === 'ROLE_HR_EXECUTIVE'
  const canCreateFinance = userRole === 'ROLE_FINANCE_MANAGER'
  const canCreateDept = userRole === 'ROLE_DEPARTMENT_MANAGER'
  const canCreateTeam = userRole === 'ROLE_MANAGER' || userRole === 'ROLE_TEAM_LEAD'
  const canCreateAny = canCreateGlobal || canCreateHR || canCreateFinance || canCreateDept || canCreateTeam

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    createMutation.mutate({ title: newTitle, content: newContent, type: newType })
  }

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-accent-blue" />
          <h2 className="text-lg font-bold text-white tracking-tight">Announcements</h2>
        </div>
        {canCreateAny && !isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="text-xs bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue px-3 py-1.5 rounded-lg transition-all"
          >
            Create
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-nexus-400 mb-1 block">Title</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue/50"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-nexus-400 mb-1 block">Content</label>
            <textarea 
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue/50 min-h-[80px]"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-nexus-400 mb-1 block">Type</label>
            <select 
              value={newType}
              onChange={e => setNewType(e.target.value as AnnouncementType)}
              className="w-full bg-[#1a1f2c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-blue/50"
            >
              {canCreateGlobal && <option value="GLOBAL">Global</option>}
              {canCreateHR && <option value="HR">HR</option>}
              {canCreateFinance && <option value="FINANCE">Finance</option>}
              {canCreateDept && <option value="DEPARTMENT">Department</option>}
              {canCreateTeam && <option value="TEAM">Team</option>}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-medium text-nexus-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all"
            >
              {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Post
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-blue" /></div>
        ) : announcementsData?.content?.length === 0 ? (
          <div className="text-center py-8 text-nexus-400 text-sm flex flex-col items-center">
            <Bell className="w-8 h-8 mb-2 opacity-50" />
            No recent announcements
          </div>
        ) : (
          announcementsData?.content?.map((announcement: AnnouncementDto) => (
            <div key={announcement.id} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 transition-all hover:bg-white/[0.05]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    announcement.type === 'GLOBAL' ? 'bg-danger/20 text-danger' :
                    announcement.type === 'HR' ? 'bg-accent-violet/20 text-accent-violet' :
                    announcement.type === 'FINANCE' ? 'bg-accent-emerald/20 text-accent-emerald' :
                    announcement.type === 'DEPARTMENT' ? 'bg-accent-blue/20 text-accent-blue' :
                    'bg-accent-orange/20 text-accent-orange'
                  }`}>
                    {announcement.type}
                  </span>
                  <span className="text-xs text-nexus-400">
                    {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{announcement.title}</h3>
              <p className="text-sm text-nexus-300 mb-3 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {announcement.authorAvatar ? (
                    <img src={announcement.authorAvatar} alt={announcement.authorName} className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                      <span className="text-[10px] text-accent-blue font-bold">{announcement.authorName.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-xs text-nexus-400">{announcement.authorName}</span>
                </div>
                
                <button 
                  onClick={() => reactMutation.mutate(announcement.id)}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all ${
                    announcement.userReacted 
                      ? 'bg-accent-blue/20 text-accent-blue' 
                      : 'hover:bg-white/5 text-nexus-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${announcement.userReacted ? 'fill-current' : ''}`} />
                  <span>{announcement.reactionCount > 0 ? announcement.reactionCount : 'Acknowledge'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  )
}
