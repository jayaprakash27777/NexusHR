import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Rocket, Search, Calendar, Image as ImageIcon, 
  Link as LinkIcon, Send, Eye, PenTool, Loader2
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { releasesApi, type ReleaseNoteRequest } from '@/api/releases'
import { useDebounce } from '@/hooks/useDebounce'

const RELEASE_TYPES = ['MAJOR', 'MINOR', 'PATCH', 'HOTFIX', 'SECURITY'] as const
type ReleaseType = typeof RELEASE_TYPES[number]

export default function ReleaseManager() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 350)

  // Fetch releases
  const { data, isLoading } = useQuery({
    queryKey: ['releases', { search: debouncedSearch }],
    queryFn: () => releasesApi.getAll({ search: debouncedSearch || undefined, published: true, size: 50 }),
  })

  // Composer State
  const [newTitle, setNewTitle] = useState('')
  const [newVersion, setNewVersion] = useState('')
  const [newType, setNewType] = useState<ReleaseType>('MINOR')
  const [newContent, setNewContent] = useState('')

  const createMutation = useMutation({
    mutationFn: releasesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      setIsComposing(false)
      setNewTitle('')
      setNewVersion('')
      setNewContent('')
      toast.success('Release Note Published', 'Your update has been broadcasted to the platform.')
    },
    onError: (err: any) => {
      toast.error('Publishing Failed', err?.response?.data?.message || 'Failed to publish release note.')
    }
  })

  const handlePublish = () => {
    if (!newTitle || !newVersion || !newContent) {
      toast.error('Validation Error', 'Please fill out all required fields.')
      return
    }

    createMutation.mutate({
      version: newVersion,
      title: newTitle,
      releaseType: newType,
      description: newContent,
      published: true
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAJOR': return 'bg-accent-indigo/20 text-accent-indigo border-accent-indigo/30'
      case 'MINOR': return 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30'
      case 'PATCH': return 'bg-success/20 text-success border-success/30'
      case 'HOTFIX': return 'bg-warning/20 text-warning border-warning/30'
      case 'SECURITY': return 'bg-danger/20 text-danger border-danger/30'
      default: return 'bg-nexus-800 text-nexus-300 border-white/10'
    }
  }

  const releases = data?.content || []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-accent-indigo" />
            Release Management Center
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Publish product updates, bug fixes, and version history to your organization.</p>
        </div>
        <button 
          onClick={() => setIsComposing(!isComposing)} 
          className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
        >
          {isComposing ? <Eye className="h-4 w-4" /> : <PenTool className="h-4 w-4" />}
          {isComposing ? 'View Timeline' : 'Draft New Release'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex gap-6">
        
        {isComposing ? (
          /* Composer View */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex justify-center pb-12 overflow-y-auto custom-scrollbar">
            <GlassCard className="w-full max-w-4xl p-8 flex flex-col gap-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-nexus-50">Draft Release Note</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-nexus-300">Update Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. The New AI Dashboard is Here!"
                    className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-nexus-300">Version Tag</label>
                  <input 
                    type="text" 
                    value={newVersion}
                    onChange={e => setNewVersion(e.target.value)}
                    placeholder="e.g. v2.5.0"
                    className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-nexus-300">Release Type</label>
                <div className="flex flex-wrap items-center gap-4">
                  {RELEASE_TYPES.map(type => (
                    <label key={type} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${newType === type ? 'border-accent-indigo bg-accent-indigo/10 text-accent-indigo' : 'border-white/10 bg-white/5 text-nexus-400 hover:bg-white/10'}`}>
                      <input 
                        type="radio" 
                        name="releaseType" 
                        value={type} 
                        checked={newType === type}
                        onChange={() => setNewType(type as ReleaseType)}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-sm font-medium text-nexus-300 flex items-center justify-between">
                  Content Body
                  <div className="flex items-center gap-2 bg-nexus-900 rounded-md p-1 border border-white/10">
                    <button type="button" className="p-1.5 rounded hover:bg-white/10 text-nexus-400 hover:text-nexus-100 transition-colors"><ImageIcon className="h-4 w-4" /></button>
                    <button type="button" className="p-1.5 rounded hover:bg-white/10 text-nexus-400 hover:text-nexus-100 transition-colors"><LinkIcon className="h-4 w-4" /></button>
                  </div>
                </label>
                <textarea 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Describe the update in detail using Markdown..."
                  className="w-full flex-1 min-h-[250px] rounded-lg border border-white/10 bg-nexus-900/50 p-4 text-sm text-white focus:border-accent-indigo focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={handlePublish} 
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-accent-indigo px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish to Organization
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* Timeline View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-0">
            <GlassCard className="p-4 mb-6 flex items-center justify-between shrink-0">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-400" />
                <input
                  type="text"
                  placeholder="Search release notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-nexus-900/50 pl-10 pr-4 text-sm text-nexus-100 placeholder:text-nexus-500 focus:border-accent-indigo focus:outline-none"
                />
              </div>
            </GlassCard>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative pl-6">
              {/* Timeline Track */}
              <div className="absolute top-0 bottom-0 left-8 w-px bg-white/10" />

              <div className="space-y-12 pb-12">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="relative pl-12 pr-4 animate-pulse">
                      <div className="absolute top-0 left-[-5px] h-6 w-6 rounded-full border-4 border-nexus-950 bg-white/10" />
                      <div className="h-40 rounded-xl bg-white/5" />
                    </div>
                  ))
                ) : releases.length === 0 ? (
                  <div className="relative pl-12 pr-4 py-12 text-center text-nexus-400">
                    No release notes found.
                  </div>
                ) : releases.map((release) => (
                  <div key={release.id} className="relative pl-12 pr-4">
                    {/* Timeline Node */}
                    <div className={`absolute top-0 left-[-5px] h-6 w-6 rounded-full border-4 border-nexus-950 flex items-center justify-center ${getTypeColor(release.releaseType).split(' ')[0]} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>

                    <GlassCard className="p-6 transition-all hover:border-white/20 hover:shadow-xl">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-bold text-accent-indigo">{release.version}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${getTypeColor(release.releaseType)}`}>
                              {release.releaseType}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-nexus-50">{release.title}</h2>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-sm text-nexus-400 whitespace-nowrap">
                            <Calendar className="h-4 w-4" />
                            {release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : 'Draft'}
                          </div>
                          <div className="text-xs text-nexus-500">
                            {formatDistanceToNow(release.createdAt, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-nexus-300 leading-relaxed bg-white/5 rounded-lg p-4 border border-white/5 whitespace-pre-wrap">
                        {release.description}
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
