import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leavesApi } from '@/api/leaves'
import { employeesApi } from '@/api/employees'
import { toast } from '@/store/toast'
import GlassCard from '@/components/ui/GlassCard'

interface GrantCompOffModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GrantCompOffModal({ isOpen, onClose }: GrantCompOffModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    employeeId: '',
    days: 1
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesApi.getAll({ page: 0, size: 100 }),
    enabled: isOpen
  })
  
  const employees = employeesData?.content || []

  const mutation = useMutation({
    mutationFn: () => leavesApi.grantCompOff(formData.employeeId, formData.days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'balance'] })
      toast.success('Comp-Off Granted', 'Compensatory off has been granted to the employee.')
      onClose()
    },
    onError: () => toast.error('Error', 'Failed to grant compensatory off.')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.employeeId || formData.days <= 0) return
    mutation.mutate()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-md z-10"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Grant Comp-Off</h2>
              <button onClick={onClose} className="p-2 text-nexus-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Select Employee</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50 [&>option]:bg-nexus-900"
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Number of Days</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-nexus-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending || !formData.employeeId}
                  className="px-4 py-2 bg-accent-indigo text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Grant Days
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
