import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { 
  FileText, Type, Hash, CalendarDays, ChevronDown, CheckSquare, 
  Upload, PenTool, Plus, Save, Settings, GripVertical, Trash2, X
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'file' | 'signature'

interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  options?: string[] // For dropdowns
}

const FIELD_ICONS: Record<FieldType, any> = {
  text: Type,
  number: Hash,
  date: CalendarDays,
  dropdown: ChevronDown,
  checkbox: CheckSquare,
  file: Upload,
  signature: PenTool,
}

export default function FormBuilder() {
  const [formName, setFormName] = useState('New Onboarding Form')
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'text', label: 'Full Legal Name', required: true },
    { id: '2', type: 'date', label: 'Start Date', required: true },
    { id: '3', type: 'dropdown', label: 'Department', required: true, options: ['Engineering', 'Design', 'Sales', 'HR'] },
  ])
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === 'dropdown' ? { options: ['Option 1'] } : {})
    }
    setFields([...fields, newField])
    setActiveFieldId(newField.id)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
    if (activeFieldId === id) setActiveFieldId(null)
  }

  const handleSave = () => {
    toast.success('Form Saved', `${formName} has been saved successfully.`)
  }

  const activeField = fields.find(f => f.id === activeFieldId)

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent-indigo" />
            <input 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="text-2xl font-bold text-nexus-50 bg-transparent border-none focus:outline-none focus:ring-0 px-0 py-0"
            />
          </div>
          <p className="text-sm text-nexus-400 mt-1">Drag and drop fields to create dynamic enterprise forms.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors">
            <Settings className="h-4 w-4" /> Form Settings
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
            <Save className="h-4 w-4" /> Publish Form
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Field Palette */}
        <div className="lg:w-64 space-y-4">
          <GlassCard className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-nexus-100 uppercase tracking-wider mb-4">Add Fields</h3>
            <div className="space-y-2">
              {(Object.keys(FIELD_ICONS) as FieldType[]).map(type => {
                const Icon = FIELD_ICONS[type]
                return (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-md bg-nexus-800 text-nexus-300 group-hover:text-accent-indigo transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-nexus-200 capitalize">{type}</span>
                    <Plus className="h-4 w-4 ml-auto text-nexus-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </div>

        {/* Builder Canvas */}
        <div className="flex-1">
          <GlassCard className="p-6 h-full flex flex-col overflow-hidden bg-nexus-900/30">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-nexus-500 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">Drag or click fields from the left to build your form.</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4 pb-12">
                  {fields.map(field => {
                    const Icon = FIELD_ICONS[field.type]
                    const isActive = activeFieldId === field.id
                    return (
                      <Reorder.Item key={field.id} value={field}>
                        <div 
                          onClick={() => setActiveFieldId(field.id)}
                          className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-accent-indigo/5 border-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                              : 'bg-nexus-900/80 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="pt-1 cursor-grab active:cursor-grabbing text-nexus-600 hover:text-nexus-400">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-nexus-50">
                                {field.label}
                                {field.required && <span className="text-danger ml-1">*</span>}
                              </span>
                            </div>
                            
                            {/* Dummy visual representation of the field */}
                            <div className="opacity-50 pointer-events-none">
                              {field.type === 'text' || field.type === 'number' || field.type === 'date' ? (
                                <div className="h-10 w-full max-w-md rounded-lg border border-white/10 bg-nexus-950 px-4 py-2 text-sm text-nexus-500 flex items-center gap-2">
                                  <Icon className="h-4 w-4" /> Enter {field.type}...
                                </div>
                              ) : field.type === 'dropdown' ? (
                                <div className="h-10 w-full max-w-md rounded-lg border border-white/10 bg-nexus-950 px-4 py-2 text-sm text-nexus-500 flex items-center justify-between">
                                  Select an option... <ChevronDown className="h-4 w-4" />
                                </div>
                              ) : field.type === 'checkbox' ? (
                                <div className="flex items-center gap-2 text-sm text-nexus-400">
                                  <div className="h-4 w-4 rounded border border-white/20" /> Check to agree
                                </div>
                              ) : field.type === 'file' ? (
                                <div className="h-24 w-full max-w-md rounded-lg border-2 border-dashed border-white/10 bg-nexus-950 flex flex-col items-center justify-center gap-2 text-nexus-500">
                                  <Upload className="h-5 w-5" /> Click to upload
                                </div>
                              ) : (
                                <div className="h-24 w-full max-w-md rounded-lg border border-white/10 bg-nexus-950 flex flex-col items-center justify-center gap-2 text-nexus-500">
                                  <PenTool className="h-5 w-5" /> Sign here
                                </div>
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                            className={`p-2 rounded-lg text-nexus-500 hover:bg-danger/10 hover:text-danger transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Reorder.Item>
                    )
                  })}
                </Reorder.Group>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Field Properties Panel */}
        <div className="lg:w-72 space-y-4">
          <GlassCard className="p-5 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-nexus-100 uppercase tracking-wider mb-6">Field Properties</h3>
            
            {activeField ? (
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-nexus-300">Field Label</label>
                  <input 
                    type="text" 
                    value={activeField.label}
                    onChange={(e) => updateField(activeField.id, { label: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-nexus-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={activeField.required}
                      onChange={(e) => updateField(activeField.id, { required: e.target.checked })}
                      className="rounded border-white/20 bg-nexus-900 text-accent-indigo focus:ring-accent-indigo"
                    />
                    Required Field
                  </label>
                </div>

                {activeField.type === 'dropdown' && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-xs font-medium text-nexus-300">Dropdown Options</label>
                    {activeField.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(activeField.options || [])]
                            newOpts[idx] = e.target.value
                            updateField(activeField.id, { options: newOpts })
                          }}
                          className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-1.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            const newOpts = activeField.options?.filter((_, i) => i !== idx)
                            updateField(activeField.id, { options: newOpts })
                          }}
                          className="p-1.5 text-nexus-500 hover:text-danger"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => updateField(activeField.id, { options: [...(activeField.options || []), `Option ${(activeField.options?.length || 0) + 1}`] })}
                      className="flex items-center gap-1 text-xs font-medium text-accent-indigo hover:text-indigo-400"
                    >
                      <Plus className="h-3 w-3" /> Add Option
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-sm text-nexus-500">
                Select a field to edit its properties.
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
