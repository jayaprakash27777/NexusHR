import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus, Users, Loader2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { attendanceApi } from '@/api/attendance'
import { employeesApi } from '@/api/employees'
import { toast } from '@/store/toast'
import { motion } from 'framer-motion'

export default function ShiftManagement() {
  const queryClient = useQueryClient()
  const [isAddMode, setIsAddMode] = useState(false)
  const [newShift, setNewShift] = useState({ name: '', startTime: '09:00', endTime: '18:00', description: '' })
  
  // Shift assignment state
  const [selectedShiftId, setSelectedShiftId] = useState<string>('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

  const { data: shifts, isLoading: loadingShifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => attendanceApi.getAllShifts()
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesApi.getAll({ page: 0, size: 100 })
  })
  
  const employees = employeesData?.content || []

  const createMutation = useMutation({
    mutationFn: (data: any) => attendanceApi.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift Created', 'New shift has been created.')
      setIsAddMode(false)
    },
    onError: () => toast.error('Error', 'Failed to create shift.')
  })

  const assignMutation = useMutation({
    mutationFn: ({ shiftId, employeeId }: { shiftId: string, employeeId: string }) => attendanceApi.assignShift(shiftId, employeeId),
    onSuccess: () => {
      toast.success('Shift Assigned', 'Shift successfully assigned to employee.')
      setSelectedEmployeeId('')
    },
    onError: () => toast.error('Error', 'Failed to assign shift.')
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name: newShift.name,
      startTime: newShift.startTime + ':00',
      endTime: newShift.endTime + ':00',
      description: newShift.description
    })
  }

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShiftId || !selectedEmployeeId) return
    assignMutation.mutate({ shiftId: selectedShiftId, employeeId: selectedEmployeeId })
  }

  if (loadingShifts) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-accent-indigo" /></div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Active Shifts</h3>
            <button 
              onClick={() => setIsAddMode(!isAddMode)}
              className="text-sm flex items-center gap-1 text-accent-indigo hover:text-indigo-400"
            >
              <Plus className="h-4 w-4" /> Create Shift
            </button>
          </div>

          {isAddMode && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl space-y-4"
              onSubmit={handleCreateSubmit}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-nexus-400 mb-1">Shift Name</label>
                  <input type="text" required value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="e.g. Night Shift" />
                </div>
                <div>
                  <label className="block text-xs text-nexus-400 mb-1">Start Time</label>
                  <input type="time" required value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-nexus-400 mb-1">End Time</label>
                  <input type="time" required value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-nexus-400 mb-1">Description</label>
                  <input type="text" value={newShift.description} onChange={e => setNewShift({...newShift, description: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddMode(false)} className="px-3 py-1.5 text-xs text-nexus-300 hover:text-white">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-3 py-1.5 bg-accent-indigo text-white text-xs rounded-lg flex items-center gap-1">
                  {createMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />} Save Shift
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts?.map((shift: any) => (
              <div key={shift.id} className="p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-nexus-50">{shift.name}</h4>
                  <Clock className="h-4 w-4 text-accent-indigo" />
                </div>
                <p className="text-sm text-nexus-300 mb-3">{shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}</p>
                {shift.description && <p className="text-xs text-nexus-500">{shift.description}</p>}
              </div>
            ))}
            {(!shifts || shifts.length === 0) && (
              <div className="col-span-full text-center py-8 text-nexus-500 text-sm">No shifts defined.</div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-accent-indigo" />
            <h3 className="text-lg font-semibold text-white">Assign Shift</h3>
          </div>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-nexus-300 mb-1">Select Employee</label>
              <select required value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm [&>option]:bg-nexus-900">
                <option value="">Choose an employee...</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-nexus-300 mb-1">Select Shift</label>
              <select required value={selectedShiftId} onChange={e => setSelectedShiftId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm [&>option]:bg-nexus-900">
                <option value="">Choose a shift...</option>
                {shifts?.map((shift: any) => (
                  <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime.slice(0,5)} - {shift.endTime.slice(0,5)})</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={assignMutation.isPending || !selectedEmployeeId || !selectedShiftId} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
              {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Assign
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
