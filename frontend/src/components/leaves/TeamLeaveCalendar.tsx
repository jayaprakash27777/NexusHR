import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { leavesApi } from '@/api/leaves'
import { useAuthStore } from '@/store'
import GlassCard from '@/components/ui/GlassCard'
import { Loader2 } from 'lucide-react'

export default function TeamLeaveCalendar() {
  const { user } = useAuthStore()
  
  const { data: teamLeavesData, isLoading } = useQuery({
    queryKey: ['leaves', 'team', user?.employeeId, 'all'],
    queryFn: () => leavesApi.getAllForManager(user?.employeeId as string, 0, 100),
    enabled: !!user?.employeeId,
  })

  const leaves = teamLeavesData?.content || []
  
  // Create a 14-day view starting from today
  const today = new Date()
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d
  })

  if (isLoading) {
    return (
      <GlassCard className="p-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-accent-indigo animate-spin" />
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6 overflow-hidden">
      <h3 className="text-lg font-semibold text-white mb-6">Upcoming Team Leaves (14 Days)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-nexus-400 bg-white/5 border-b border-white/10">Employee</th>
              {days.map(d => (
                <th key={d.toISOString()} className="px-2 py-2 text-center text-xs font-semibold text-nexus-400 bg-white/5 border-b border-white/10 min-w-[40px]">
                  <div>{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className="text-white">{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaves.filter((l: any) => l.status === 'APPROVED').length === 0 ? (
              <tr>
                <td colSpan={days.length + 1} className="text-center py-8 text-nexus-400">No approved upcoming leaves for the team.</td>
              </tr>
            ) : null}
            {leaves
              .filter((l: any) => l.status === 'APPROVED')
              .map((leave: any) => {
                const startDate = new Date(leave.startDate)
                startDate.setHours(0,0,0,0)
                const endDate = new Date(leave.endDate)
                endDate.setHours(23,59,59,999)

                return (
                  <tr key={leave.id} className="border-b border-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-nexus-100">{leave.employeeName}</td>
                    {days.map(d => {
                      const isLeaveDay = d >= startDate && d <= endDate
                      return (
                        <td key={d.toISOString()} className="px-1 py-3 text-center relative">
                          {isLeaveDay && (
                            <div 
                              className="absolute inset-y-2 left-0 right-0 bg-accent-indigo/20 border-y border-accent-indigo/40"
                              title={`${leave.leaveType.replace('_', ' ')}: ${leave.reason}`}
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
