import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { SalaryStructureRequest, SalaryStructureResponse } from '@/api/payroll'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SalaryStructureRequest) => void
  isSaving: boolean
  initialData?: SalaryStructureResponse | null
}

export default function SalaryStructureModal({ isOpen, onClose, onSave, isSaving, initialData }: Props) {
  const [formData, setFormData] = useState<SalaryStructureRequest>({
    name: '',
    description: '',
    basicSalary: 0,
    hraPercentage: 40,
    daPercentage: 10,
    pfPercentage: 12,
    otherAllowances: 0,
    active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || '',
          basicSalary: initialData.basicSalary,
          hraPercentage: initialData.hraPercentage,
          daPercentage: initialData.daPercentage,
          pfPercentage: initialData.pfPercentage,
          otherAllowances: initialData.otherAllowances,
          active: initialData.active
        })
      } else {
        setFormData({
          name: '',
          description: '',
          basicSalary: 0,
          hraPercentage: 40,
          daPercentage: 10,
          pfPercentage: 12,
          otherAllowances: 0,
          active: true
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (formData.basicSalary < 0) newErrors.basicSalary = 'Cannot be negative'
    if (formData.hraPercentage < 0 || formData.hraPercentage > 100) newErrors.hraPercentage = 'Must be 0-100'
    if (formData.daPercentage < 0 || formData.daPercentage > 100) newErrors.daPercentage = 'Must be 0-100'
    if (formData.pfPercentage < 0 || formData.pfPercentage > 100) newErrors.pfPercentage = 'Must be 0-100'
    if (formData.otherAllowances < 0) newErrors.otherAllowances = 'Cannot be negative'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[var(--radius-xl)] bg-[#0A0A0F] shadow-2xl border border-white/10"
        >
          {/* Glass header */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-accent-indigo/20 to-accent-violet/5 opacity-50 pointer-events-none" />
          
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Structure' : 'Create Structure'}</h2>
                <p className="text-nexus-400 text-sm mt-1">Define standardized compensation rules</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-nexus-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Structure Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-white/[0.03] border ${errors.name ? 'border-danger' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all`}
                    placeholder="e.g. Senior Software Engineer Tier 1"
                  />
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Basic Salary *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-500">₹</span>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className={`w-full bg-white/[0.03] border ${errors.basicSalary ? 'border-danger' : 'border-white/10'} rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all`}
                    />
                  </div>
                  {errors.basicSalary && <p className="text-danger text-xs mt-1">{errors.basicSalary}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Other Allowances</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-500">₹</span>
                    <input
                      type="number"
                      value={formData.otherAllowances}
                      onChange={(e) => setFormData({ ...formData, otherAllowances: Number(e.target.value) })}
                      className={`w-full bg-white/[0.03] border ${errors.otherAllowances ? 'border-danger' : 'border-white/10'} rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all`}
                    />
                  </div>
                  {errors.otherAllowances && <p className="text-danger text-xs mt-1">{errors.otherAllowances}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">HRA % (of Basic) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hraPercentage}
                      onChange={(e) => setFormData({ ...formData, hraPercentage: Number(e.target.value) })}
                      className={`w-full bg-white/[0.03] border ${errors.hraPercentage ? 'border-danger' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-nexus-500">%</span>
                  </div>
                  {errors.hraPercentage && <p className="text-danger text-xs mt-1">{errors.hraPercentage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">DA % (of Basic) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.daPercentage}
                      onChange={(e) => setFormData({ ...formData, daPercentage: Number(e.target.value) })}
                      className={`w-full bg-white/[0.03] border ${errors.daPercentage ? 'border-danger' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-nexus-500">%</span>
                  </div>
                  {errors.daPercentage && <p className="text-danger text-xs mt-1">{errors.daPercentage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">PF % (of Basic) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pfPercentage}
                      onChange={(e) => setFormData({ ...formData, pfPercentage: Number(e.target.value) })}
                      className={`w-full bg-white/[0.03] border ${errors.pfPercentage ? 'border-danger' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent-indigo transition-all`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-nexus-500">%</span>
                  </div>
                  {errors.pfPercentage && <p className="text-danger text-xs mt-1">{errors.pfPercentage}</p>}
                </div>

                <div className="flex items-center mt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-indigo"></div>
                    <span className="ml-3 text-sm font-medium text-nexus-300">Active Structure</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent-indigo hover:bg-accent-indigo/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {initialData ? 'Update Structure' : 'Create Structure'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
