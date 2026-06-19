import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  BookOpen, Search, Folder, FileText, ChevronRight, Bookmark, 
  ThumbsUp, Eye, Clock, Hash, PenTool, Loader2, AlertCircle
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { knowledgeApi, type KnowledgeArticle, type KnowledgeArticleRequest } from '@/api/knowledge'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDistanceToNow } from '@/lib/dateUtils'

const defaultCategories = ['Employee Handbook', 'IT & Security', 'Benefits & Perks', 'Engineering', 'Sales Playbook', 'General']

export default function KnowledgeBase() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 350)

  // Fetch articles
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', { search: debouncedSearch, category: activeCategory }],
    queryFn: () => knowledgeApi.getAll({ 
      search: debouncedSearch || undefined, 
      category: activeCategory === 'All' ? undefined : activeCategory,
      size: 50
    }),
  })

  // Fetch single article details (when clicked)
  const { data: activeArticle, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['knowledgeArticle', activeArticleId],
    queryFn: () => knowledgeApi.getById(activeArticleId!),
    enabled: !!activeArticleId,
  })

  // Composer state
  const [form, setForm] = useState<Partial<KnowledgeArticleRequest>>({
    category: 'General',
    status: 'PUBLISHED'
  })

  const createMutation = useMutation({
    mutationFn: knowledgeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      toast.success('Article Published', 'Your article is now live in the Knowledge Base.')
      setIsComposing(false)
      setForm({ category: 'General', status: 'PUBLISHED' })
    },
    onError: (err: any) => {
      toast.error('Publication Failed', err?.response?.data?.message || 'Failed to publish article.')
    }
  })

  const helpfulMutation = useMutation({
    mutationFn: ({ id, isHelpful }: { id: string, isHelpful: boolean }) => knowledgeApi.markHelpful(id, isHelpful),
    onSuccess: (updatedArticle) => {
      queryClient.setQueryData(['knowledgeArticle', updatedArticle.id], updatedArticle)
      toast.success('Feedback Recorded', 'Thank you for your feedback!')
    }
  })

  const handlePublish = () => {
    if (!form.title || !form.content) {
      toast.error('Validation Error', 'Title and content are required.')
      return
    }
    createMutation.mutate(form as KnowledgeArticleRequest)
  }

  const handleMarkHelpful = (isHelpful: boolean) => {
    if (!activeArticleId) return
    helpfulMutation.mutate({ id: activeArticleId, isHelpful })
  }

  const articles = data?.content || []

  // Extract unique categories from DB, merging with defaults
  const dbCategories = new Set(articles.map(a => a.category).filter(Boolean))
  defaultCategories.forEach(c => dbCategories.add(c))
  const categories = Array.from(dbCategories).sort()

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-accent-indigo" />
            Knowledge Base
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Company wiki, standard operating procedures, and internal documentation.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeArticleId && !isComposing && (
            <button 
              onClick={() => setActiveArticleId(null)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors"
            >
              Back to Directory
            </button>
          )}
          {!isComposing && (
            <button 
              onClick={() => { setIsComposing(true); setActiveArticleId(null); }}
              className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
            >
              <PenTool className="h-4 w-4" /> New Article
            </button>
          )}
          {isComposing && (
            <button 
              onClick={() => setIsComposing(false)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors"
            >
              Cancel Draft
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Sidebar */}
        <div className="lg:w-1/4 xl:w-1/5 space-y-4 flex flex-col">
          <GlassCard className="p-4 flex flex-col gap-2 flex-1 min-h-0">
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-nexus-900/50 pl-10 pr-4 text-sm text-nexus-100 placeholder:text-nexus-500 focus:border-accent-indigo focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
              <h3 className="text-[10px] font-bold text-nexus-500 uppercase tracking-wider mb-2 px-3">Categories</h3>
              
              <button
                onClick={() => setActiveCategory('All')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                  activeCategory === 'All' 
                    ? 'bg-accent-indigo/10 border-accent-indigo text-accent-indigo' 
                    : 'border-transparent text-nexus-300 hover:bg-white/5 hover:text-nexus-100'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Folder className={`h-4 w-4 ${activeCategory === 'All' ? 'text-accent-indigo' : 'text-nexus-500'}`} />
                  All Articles
                </div>
              </button>

              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                    activeCategory === cat 
                      ? 'bg-accent-indigo/10 border-accent-indigo text-accent-indigo' 
                      : 'border-transparent text-nexus-300 hover:bg-white/5 hover:text-nexus-100'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Folder className={`h-4 w-4 ${activeCategory === cat ? 'text-accent-indigo' : 'text-nexus-500'}`} />
                    {cat}
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* Article Reader View */}
            {activeArticleId && !isComposing && (
              <motion.div 
                key="reader"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar"
              >
                <GlassCard className="p-8 md:p-12 min-h-full max-w-4xl mx-auto">
                  {isLoadingArticle || !activeArticle ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                      <Loader2 className="h-8 w-8 text-accent-indigo animate-spin" />
                      <p className="text-nexus-300">Loading article...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm text-nexus-400 mb-6">
                        <Folder className="h-4 w-4" /> {activeArticle.category}
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-nexus-200">Article</span>
                      </div>
                      
                      <h1 className="text-3xl md:text-4xl font-bold text-nexus-50 mb-6">{activeArticle.title}</h1>
                      
                      <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-white/10 mb-8 text-sm text-nexus-400">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {Math.max(1, Math.ceil(activeArticle.content.length / 1000))} min read</div>
                        <div className="flex items-center gap-2"><Eye className="h-4 w-4" /> {activeArticle.views.toLocaleString()} views</div>
                        <div className="flex items-center gap-2 text-success"><ThumbsUp className="h-4 w-4" /> {activeArticle.helpfulCount} helpful</div>
                        <div className="flex items-center gap-2 text-nexus-500">Updated {formatDistanceToNow(activeArticle.updatedAt, { addSuffix: true })}</div>
                      </div>

                      <div className="prose prose-invert max-w-none prose-p:text-nexus-200 prose-headings:text-nexus-50 prose-a:text-accent-indigo whitespace-pre-wrap">
                        {activeArticle.content}
                      </div>

                      <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center justify-center gap-4">
                        <h4 className="text-sm font-medium text-nexus-300">Was this article helpful?</h4>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleMarkHelpful(true)}
                            disabled={helpfulMutation.isPending}
                            className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-success/10 hover:text-success hover:border-success/30 text-nexus-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <ThumbsUp className="h-4 w-4" /> Yes
                          </button>
                          <button 
                            onClick={() => handleMarkHelpful(false)}
                            disabled={helpfulMutation.isPending}
                            className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-danger/10 hover:text-danger hover:border-danger/30 text-nexus-200 transition-colors disabled:opacity-50"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Composer View */}
            {isComposing && (
              <motion.div 
                key="composer"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar"
              >
                <GlassCard className="p-8 min-h-full max-w-4xl mx-auto flex flex-col">
                  <div className="mb-6 flex items-center justify-between pb-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-nexus-50">Create New Article</h2>
                    <button 
                      onClick={handlePublish}
                      disabled={createMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-accent-indigo px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Publish Article
                    </button>
                  </div>

                  <div className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={form.title || ''}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Article Title..."
                        className="w-full bg-transparent text-3xl font-bold text-nexus-50 border-none focus:outline-none placeholder:text-nexus-600 px-0"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-nexus-400">Category</label>
                        <select 
                          value={form.category}
                          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                        >
                          <option disabled value="">Select a category...</option>
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-nexus-400">Tags</label>
                        <input 
                          type="text" 
                          value={form.tags?.join(', ') || ''}
                          onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                          placeholder="e.g. security, onboarding"
                          className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col min-h-[400px]">
                      <div className="flex items-center gap-2 bg-nexus-900 rounded-t-lg p-2 border border-b-0 border-white/10">
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-nexus-400"><strong className="font-serif">B</strong></button>
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-nexus-400"><em className="font-serif">I</em></button>
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-nexus-400"><Hash className="h-4 w-4" /></button>
                        <button type="button" className="p-1.5 rounded hover:bg-white/10 text-nexus-400"><Bookmark className="h-4 w-4" /></button>
                      </div>
                      <textarea 
                        value={form.content || ''}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="Start writing using Markdown..."
                        className="w-full flex-1 rounded-b-lg border border-white/10 bg-nexus-900/50 p-6 text-sm text-nexus-200 focus:outline-none resize-none custom-scrollbar"
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Directory View */}
            {!activeArticleId && !isComposing && (
              <motion.div 
                key="directory"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar"
              >
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-[280px] rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {articles.map(article => (
                      <GlassCard 
                        key={article.id} 
                        className="p-5 flex flex-col h-[280px] cursor-pointer group hover:border-accent-indigo/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all"
                        onClick={() => setActiveArticleId(article.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 rounded-lg bg-white/5 text-nexus-300 group-hover:bg-accent-indigo/20 group-hover:text-accent-indigo transition-colors">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="px-2 py-1 rounded-md bg-nexus-800 text-[10px] font-bold text-nexus-400 border border-white/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                            {article.category}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-nexus-50 mb-2 group-hover:text-accent-indigo transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-sm text-nexus-400 line-clamp-3 mb-4 flex-1">
                          {article.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-nexus-500 pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {Math.max(1, Math.ceil(article.content.length / 1000))}m</div>
                          <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {article.views}</div>
                          <div className="flex items-center gap-1.5 text-success"><ThumbsUp className="h-3.5 w-3.5" /> {article.helpfulCount}</div>
                        </div>
                      </GlassCard>
                    ))}
                    
                    {articles.length === 0 && (
                      <div className="col-span-full h-40 flex flex-col items-center justify-center text-nexus-500 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                        <Search className="h-8 w-8 mb-3 opacity-50" />
                        <p>No articles found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </PageTransition>
  )
}
