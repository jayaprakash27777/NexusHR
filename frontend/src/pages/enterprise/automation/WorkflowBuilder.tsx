import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Workflow, Zap, Play, CheckCircle2, Clock, Mail, UserPlus, 
  ArrowRight, Plus, Settings, Save, AlertCircle
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

type NodeType = 'trigger' | 'action' | 'condition' | 'delay'

interface WorkflowNode {
  id: string
  type: NodeType
  title: string
  description: string
  icon: any
  config?: any
}

const triggerOptions = [
  { id: 'emp_created', title: 'Employee Created', description: 'Triggers when a new employee record is added.', icon: UserPlus },
  { id: 'leave_req', title: 'Leave Requested', description: 'Triggers when a leave request is submitted.', icon: Clock },
]

const actionOptions = [
  { id: 'send_email', title: 'Send Email', description: 'Sends an automated email to specified recipients.', icon: Mail },
  { id: 'assign_task', title: 'Assign Task', description: 'Creates a task for an employee or manager.', icon: CheckCircle2 },
]

export default function WorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('Onboarding Automation Sequence')
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'trigger', title: 'Employee Created', description: 'When a new employee is onboarded', icon: UserPlus },
    { id: '2', type: 'delay', title: 'Wait 1 Day', description: 'Delay before next action', icon: Clock },
    { id: '3', type: 'action', title: 'Send Welcome Email', description: 'Send IT onboarding instructions', icon: Mail },
    { id: '4', type: 'action', title: 'Assign Manager Tasks', description: 'Create 30-60-90 day check-ins', icon: CheckCircle2 },
  ])
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const handleSave = () => {
    toast.success('Workflow Published', `${workflowName} is now active.`)
  }

  const addNode = (node: any) => {
    setNodes([...nodes, { ...node, id: Math.random().toString(36).substring(7), type: 'action' }])
  }

  const activeNode = nodes.find(n => n.id === activeNodeId)

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Workflow className="h-6 w-6 text-accent-cyan" />
            <input 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold text-nexus-50 bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0 w-full min-w-[300px]"
            />
          </div>
          <p className="text-sm text-nexus-400 mt-1">Design automated HR workflows using triggers, conditions, and actions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Active
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors">
            <Play className="h-4 w-4" /> Test Workflow
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
            <Save className="h-4 w-4" /> Publish Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Canvas */}
        <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexus-900/50 via-nexus-950 to-nexus-950 relative">
          
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

          <div className="absolute inset-0 overflow-auto p-12 flex flex-col items-center custom-scrollbar">
            
            {nodes.map((node, index) => {
              const Icon = node.icon
              const isTrigger = index === 0
              const isActive = activeNodeId === node.id

              return (
                <div key={node.id} className="relative flex flex-col items-center w-full max-w-[320px]">
                  
                  {/* The Node */}
                  <div 
                    onClick={() => setActiveNodeId(node.id)}
                    className={`relative z-10 w-full rounded-xl border p-4 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                        : isTrigger 
                          ? 'bg-nexus-900/90 border-white/20 hover:border-white/30'
                          : 'bg-nexus-900/90 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isTrigger ? 'bg-accent-indigo/20 text-accent-indigo' : 'bg-white/5 text-nexus-300'}`}>
                        {isTrigger ? <Zap className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-nexus-500 mb-1">
                          {isTrigger ? 'Trigger' : node.type}
                        </div>
                        <h4 className="text-sm font-semibold text-nexus-50">{node.title}</h4>
                        <p className="text-xs text-nexus-400 mt-1 line-clamp-2">{node.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < nodes.length - 1 && (
                    <div className="h-10 w-px bg-gradient-to-b from-white/20 to-white/5 relative my-2">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-nexus-950 p-1 rounded-full border border-white/10">
                        <ArrowRight className="h-3 w-3 text-nexus-500 rotate-90" />
                      </div>
                    </div>
                  )}

                  {/* Add Node Button (Bottom) */}
                  {index === nodes.length - 1 && (
                    <>
                      <div className="h-10 w-px bg-white/10 relative my-2 border-l border-dashed border-white/20" />
                      <button className="relative z-10 flex items-center justify-center h-10 w-10 rounded-full border border-dashed border-white/20 bg-nexus-900/50 text-nexus-400 hover:text-nexus-100 hover:border-white/40 hover:bg-white/5 transition-all">
                        <Plus className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Node Configuration Panel */}
        <div className="lg:w-80 space-y-4">
          <GlassCard className="p-5 h-full flex flex-col">
            {activeNode ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                  <div className="p-2 rounded-lg bg-accent-indigo/20 text-accent-indigo">
                    {activeNode.type === 'trigger' ? <Zap className="h-5 w-5" /> : <activeNode.icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-nexus-50">{activeNode.title}</h3>
                    <p className="text-xs text-nexus-400 uppercase tracking-wider">{activeNode.type}</p>
                  </div>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-nexus-300">Node Title</label>
                    <input 
                      type="text" 
                      value={activeNode.title}
                      readOnly
                      className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-nexus-300 focus:outline-none"
                    />
                  </div>

                  {activeNode.type === 'action' && activeNode.title === 'Send Welcome Email' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-nexus-300">Recipient</label>
                        <select className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-white focus:outline-none">
                          <option>New Employee (Personal Email)</option>
                          <option>New Employee (Work Email)</option>
                          <option>Hiring Manager</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-nexus-300">Email Template</label>
                        <select className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-white focus:outline-none">
                          <option>Welcome to NexusHR (Default)</option>
                          <option>IT Equipment Setup</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeNode.type === 'delay' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-nexus-300">Duration</label>
                          <input type="number" defaultValue={1} className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-white focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-nexus-300">Unit</label>
                          <select className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-white focus:outline-none">
                            <option>Hours</option>
                            <option selected>Days</option>
                            <option>Weeks</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeNode.type === 'trigger' && (
                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                        <p className="text-xs text-warning">This workflow will trigger automatically whenever a new employee record is created in the system.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 mt-auto">
                  <button className="flex items-center justify-center w-full gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-danger/10 hover:text-danger transition-colors">
                    Remove Node
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-nexus-100 uppercase tracking-wider mb-4">Add Action</h3>
                  <div className="space-y-2">
                    {actionOptions.map(opt => (
                      <button key={opt.id} onClick={() => addNode(opt)} className="flex items-start gap-3 w-full p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all text-left">
                        <opt.icon className="h-4 w-4 text-nexus-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-nexus-200">{opt.title}</div>
                          <div className="text-[10px] text-nexus-500 mt-0.5">{opt.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
