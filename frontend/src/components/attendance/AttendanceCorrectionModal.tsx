import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '@/api/attendance'
import { toast } from '@/store/toast'
import GlassCard from '@/components/ui/GlassCard'

interface AttendanceCorrectionModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
}

export default function AttendanceCorrectionModal({ isOpen, onClose, record }: AttendanceCorrectionModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    checkInTime: '',
    checkOutTime: '',
    status: '',
    notes: ''
  })

  useEffect(() => {
    if (record) {
      setFormData({
        checkInTime: record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : '',
        checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toISOString().slice(0, 16) : '',
        status: record.status || '',
        notes: record.notes || ''
      })
    }
  }, [record])

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload: any = { status: data.status, notes: data.notes }
      if (data.checkInTime) payload.checkInTime = new Date(data.checkInTime).toISOString()
      if (data.checkOutTime) payload.checkOutTime = new Date(data.checkOutTime).toISOString()
      return attendanceApi.correctAttendance(record.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('Attendance Corrected', 'The attendance record has been updated.')
      onClose()
    },
    onError: () => toast.error('Error', 'Failed to correct attendance record.')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  if (!isOpen || !record) return null

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
              <h2 className="text-xl font-bold text-white">Correct Attendance</h2>
              <button onClick={onClose} className="p-2 text-nexus-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Check In Time</label>
                <input
                  type="datetime-local"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Check Out Time</label>
                <input
                  type="datetime-local"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Status</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50 [&>option]:bg-nexus-900"
                >
                  <option value="">Select Status...</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
                  placeholder="Reason for correction..."
                  rows={3}
                />
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
                  Save Correction
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
