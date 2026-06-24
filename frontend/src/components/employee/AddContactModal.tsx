import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesApi } from '@/api/employees'
import { toast } from '@/store/toast'
import GlassCard from '@/components/ui/GlassCard'

interface AddContactModalProps {
  isOpen: boolean
  onClose: () => void
  employeeId: string
}

export default function AddContactModal({ isOpen, onClose, employeeId }: AddContactModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    isPrimary: false,
  })

  const mutation = useMutation({
    mutationFn: (data: any) => employeesApi.addContact(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeContacts', employeeId] })
      toast.success('Contact Added', 'Emergency contact has been added.')
      onClose()
    },
    onError: () => toast.error('Error', 'Failed to add emergency contact.')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
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
              <h2 className="text-xl font-bold text-white">Add Emergency Contact</h2>
              <button onClick={onClose} className="p-2 text-nexus-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                  placeholder="e.g. Spouse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded border-white/10 bg-white/5 text-accent-indigo focus:ring-accent-indigo/50"
                />
                <label htmlFor="isPrimary" className="text-sm text-nexus-300 cursor-pointer">
                  Set as primary emergency contact
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-nexus-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-accent-indigo text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Contact
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
