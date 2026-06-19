import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { 
  Map, Plus, Edit2, PlayCircle, ToggleRight, ToggleLeft, 
  Trash2, MonitorPlay, Save, Check, GripVertical, Type, Hash
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

interface TourStep {
  id: string
  title: string
  content: string
  targetSelector: string
}

interface ProductTour {
  id: string
  name: string
  description: string
  active: boolean
  steps: TourStep[]
}

const mockTours: ProductTour[] = [
  {
    id: '1',
    name: 'New Employee Welcome Tour',
    description: 'Guides new hires through their dashboard and immediate tasks.',
    active: true,
    steps: [
      { id: 's1', title: 'Welcome to NexusHR', content: 'This is your central hub for everything work-related.', targetSelector: '#dashboard-header' },
      { id: 's2', title: 'Pending Tasks', content: 'Here you will find items requiring your attention, like signing documents.', targetSelector: '#pending-tasks' }
    ]
  },
  {
    id: '2',
    name: 'How to Submit an Expense',
    description: 'A quick 3-step guide on creating and submitting an expense report.',
    active: false,
    steps: []
  }
]

export default function OnboardingManager() {
  const [tours, setTours] = useState<ProductTour[]>(mockTours)
  const [activeTourId, setActiveTourId] = useState<string>(mockTours[0].id)
  
  const activeTour = tours.find(t => t.id === activeTourId)

  const toggleTourStatus = (id: string) => {
    setTours(tours.map(t => t.id === id ? { ...t, active: !t.active } : t))
    toast.success('Tour Status Updated', 'The onboarding flow status has been toggled.')
  }

  const addStep = () => {
    if (!activeTour) return
    const newSteps = [...activeTour.steps, {
      id: Math.random().toString(36).substring(7),
      title: 'New Step',
      content: 'Describe what the user should do here...',
      targetSelector: '#element-id'
    }]
    setTours(tours.map(t => t.id === activeTour.id ? { ...t, steps: newSteps } : t))
  }

  const updateStep = (stepId: string, field: keyof TourStep, value: string) => {
    if (!activeTour) return
    const newSteps = activeTour.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s)
    setTours(tours.map(t => t.id === activeTour.id ? { ...t, steps: newSteps } : t))
  }

  const removeStep = (stepId: string) => {
    if (!activeTour) return
    const newSteps = activeTour.steps.filter(s => s.id !== stepId)
    setTours(tours.map(t => t.id === activeTour.id ? { ...t, steps: newSteps } : t))
  }

  const handleSave = () => {
    toast.success('Tour Saved', 'Your product tour has been successfully updated.')
  }

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Map className="h-6 w-6 text-accent-indigo" />
            Guided Product Onboarding
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Build interactive walkthroughs to guide employees through the platform.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create New Tour
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Tour List Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <GlassCard className="p-4 flex flex-col h-full gap-3">
            <h3 className="text-sm font-semibold text-nexus-100 uppercase tracking-wider mb-2">Active Tours</h3>
            {tours.map(tour => (
              <div
                key={tour.id}
                onClick={() => setActiveTourId(tour.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  activeTourId === tour.id 
                    ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`text-sm font-bold ${activeTourId === tour.id ? 'text-accent-indigo' : 'text-nexus-100'}`}>
                    {tour.name}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleTourStatus(tour.id); }}
                    className="text-nexus-400 hover:text-white transition-colors"
                  >
                    {tour.active ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-nexus-400 line-clamp-2 mb-3">{tour.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-nexus-500">
                  <MonitorPlay className="h-3 w-3" /> {tour.steps.length} Steps
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Tour Builder */}
        <div className="flex-1">
          <GlassCard className="p-6 h-full flex flex-col overflow-hidden">
            {activeTour ? (
              <>
                <div className="mb-6 flex items-start justify-between pb-6 border-b border-white/10">
                  <div className="flex-1 mr-8">
                    <input 
                      type="text"
                      value={activeTour.name}
                      onChange={(e) => setTours(tours.map(t => t.id === activeTour.id ? { ...t, name: e.target.value } : t))}
                      className="text-xl font-bold text-nexus-50 bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 w-full mb-1"
                    />
                    <input 
                      type="text"
                      value={activeTour.description}
                      onChange={(e) => setTours(tours.map(t => t.id === activeTour.id ? { ...t, description: e.target.value } : t))}
                      className="text-sm text-nexus-400 bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors">
                      <PlayCircle className="h-4 w-4" /> Preview
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
                      <Save className="h-4 w-4" /> Save Tour
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {activeTour.steps.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-nexus-500 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                      <Map className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-sm">No steps defined for this tour.</p>
                      <button onClick={addStep} className="mt-4 flex items-center gap-2 text-sm font-medium text-accent-indigo hover:text-indigo-400">
                        <Plus className="h-4 w-4" /> Add First Step
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-12">
                      {activeTour.steps.map((step, index) => (
                        <div key={step.id} className="relative flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-nexus-900/50 group hover:border-white/20 transition-all">
                          <div className="pt-1 text-nexus-600">
                            <div className="h-6 w-6 rounded-full bg-nexus-800 border border-white/20 flex items-center justify-center text-xs font-bold text-nexus-300">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-nexus-400 flex items-center gap-1"><Type className="h-3 w-3" /> Tooltip Title</label>
                                <input 
                                  value={step.title}
                                  onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                  className="w-full rounded-lg border border-white/10 bg-nexus-950 px-3 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-nexus-400 flex items-center gap-1"><Hash className="h-3 w-3" /> CSS Selector Target</label>
                                <div className="flex gap-2">
                                  <input 
                                    value={step.targetSelector}
                                    onChange={(e) => updateStep(step.id, 'targetSelector', e.target.value)}
                                    className="flex-1 rounded-lg border border-white/10 bg-nexus-950 px-3 py-2 text-sm font-mono text-accent-cyan focus:border-accent-indigo focus:outline-none"
                                  />
                                  <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-nexus-300 hover:bg-white/10 transition-colors" title="Select Element on Screen">
                                    <MonitorPlay className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-nexus-400 flex items-center gap-1"><Edit2 className="h-3 w-3" /> Tooltip Content</label>
                              <textarea 
                                value={step.content}
                                onChange={(e) => updateStep(step.id, 'content', e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-nexus-950 px-3 py-2 text-sm text-nexus-200 focus:border-accent-indigo focus:outline-none min-h-[80px] resize-none"
                              />
                            </div>
                          </div>

                          <button 
                            onClick={() => removeStep(step.id)}
                            className="p-2 rounded-lg text-nexus-500 hover:bg-danger/10 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-dashed border-white/10 flex justify-center">
                        <button onClick={addStep} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 hover:text-nexus-100 transition-colors">
                          <Plus className="h-4 w-4" /> Add Next Step
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-nexus-500">
                Select a tour from the sidebar to edit.
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
