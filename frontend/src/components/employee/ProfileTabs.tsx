import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import GlassCard from '@/components/ui/GlassCard'
import { Phone, Mail, User, Shield, CreditCard, Clock, Activity, Target } from 'lucide-react'

// Dummy imports for APIs, replace with real ones
import { attendanceApi } from '@/api/attendance'
import { leavesApi } from '@/api/leaves'
import { payrollApi } from '@/api/payroll'
import { performanceApi } from '@/api/performance'

export const BasicInfoTab = ({ employee }: { employee: any }) => (
  <GlassCard className="p-6 space-y-6">
    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
      <User className="h-5 w-5 text-accent-indigo" /> Basic Information
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      <div className="col-span-2 md:col-span-3 flex items-center gap-4 mb-2">
        <div className="h-16 w-16 rounded-full bg-nexus-800 border-2 border-white/10 overflow-hidden flex items-center justify-center">
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt={employee.fullName} className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-nexus-500" />
          )}
        </div>
        <div>
          <p className="text-xs text-nexus-500 uppercase tracking-wider mb-1">Profile Photo</p>
          <p className="text-sm text-nexus-400">Uploaded</p>
        </div>
      </div>
      <div><p className="text-xs text-nexus-500 uppercase">Employee ID</p><p className="text-sm text-white">{employee.employeeId}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Full Name</p><p className="text-sm text-white">{employee.fullName}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Official Email</p><p className="text-sm text-white">{employee.email}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Mobile Number</p><p className="text-sm text-white">{employee.phone || 'N/A'}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Date of Birth</p><p className="text-sm text-white">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Gender</p><p className="text-sm text-white">{employee.gender || 'N/A'}</p></div>
    </div>
  </GlassCard>
)

export const EmploymentTab = ({ employee }: { employee: any }) => (
  <GlassCard className="p-6 space-y-6">
    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
      <CreditCard className="h-5 w-5 text-accent-orange" /> Employment Information
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      <div><p className="text-xs text-nexus-500 uppercase">Employee Code</p><p className="text-sm text-white font-mono">{employee.employeeId}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Designation</p><p className="text-sm text-white">{employee.designation}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Department</p><p className="text-sm text-white">{employee.departmentName}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Reporting Manager</p><p className="text-sm text-white">{employee.managerName || 'N/A'}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Employment Type</p><p className="text-sm text-white">{employee.employmentType?.replace('_', ' ') || 'FULL TIME'}</p></div>
      <div><p className="text-xs text-nexus-500 uppercase">Date of Joining</p><p className="text-sm text-white">{new Date(employee.joiningDate).toLocaleDateString()}</p></div>
      <div>
        <p className="text-xs text-nexus-500 uppercase">Status</p>
        <span className={`inline-flex rounded-full px-2 py-0.5 mt-1 text-xs font-semibold ${employee.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{employee.status}</span>
      </div>
    </div>
  </GlassCard>
)

export const AttendanceTab = ({ employeeId }: { employeeId: string }) => {
  const { data } = useQuery({ queryKey: ['attendance', employeeId], queryFn: () => attendanceApi.getMonthlyAttendance(employeeId, new Date().getFullYear(), new Date().getMonth() + 1) })
  const { data: todayData } = useQuery({ queryKey: ['attendanceToday', employeeId], queryFn: () => attendanceApi.getTodayAttendance(employeeId) })
  
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-accent-cyan" /> Today's Attendance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-nexus-400">Status</p>
            <p className={`text-xl font-bold mt-2 ${todayData?.status === 'PRESENT' ? 'text-success' : 'text-nexus-500'}`}>
              {todayData?.status || 'NOT MARKED'}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-nexus-400">Check-In</p>
            <p className="text-xl font-bold text-white mt-2">
              {todayData?.checkInTime ? new Date(todayData.checkInTime).toLocaleTimeString() : '--:--'}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-nexus-400">Check-Out</p>
            <p className="text-xl font-bold text-white mt-2">
              {todayData?.checkOutTime ? new Date(todayData.checkOutTime).toLocaleTimeString() : '--:--'}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-accent-cyan" /> Monthly Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-nexus-400">Total Present Days</p>
            <p className="text-2xl font-bold text-white mt-2">{data?.length || 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-nexus-400">Attendance Percentage</p>
            <p className="text-2xl font-bold text-success mt-2">{data?.length ? Math.round((data.length / 22) * 100) : 0}%</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export const LeavesTab = ({ employeeId }: { employeeId: string }) => {
  const { data: balance } = useQuery({ queryKey: ['leaveBalance', employeeId], queryFn: () => leavesApi.getLeaveBalances(employeeId, new Date().getFullYear()) })
  const { data: history } = useQuery({ queryKey: ['leaveHistory', employeeId], queryFn: () => leavesApi.getByEmployee(employeeId, 0, 50) })

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Leave Balance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {balance?.map((b: any) => (
            <div key={b.leaveType} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-nexus-400">{b.leaveType.replace('_', ' ')}</p>
              <p className="text-xl font-bold text-white mt-1">{b.totalDays - b.usedDays} Left</p>
              <p className="text-xs text-nexus-500">of {b.totalDays} Total</p>
            </div>
          ))}
          {(!balance || balance.length === 0) && <p className="text-sm text-nexus-400">No leave balances found.</p>}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Leave History</h3>
        <div className="space-y-4">
          {history?.content?.map((h: any) => (
            <div key={h.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-white">{h.leaveType.replace('_', ' ')}</p>
                <p className="text-xs text-nexus-400 mt-1">{new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()} ({h.totalDays} days)</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                h.status === 'APPROVED' ? 'bg-success/20 text-success' : 
                h.status === 'REJECTED' ? 'bg-danger/20 text-danger' : 
                'bg-accent-orange/20 text-accent-orange'
              }`}>
                {h.status}
              </span>
            </div>
          ))}
          {(!history?.content || history.content.length === 0) && <p className="text-sm text-nexus-400">No leave history found.</p>}
        </div>
      </GlassCard>
    </div>
  )
}

export const PayrollTab = ({ employee }: { employee: any }) => {
  const { data: payslips } = useQuery({ queryKey: ['payroll', employee.id], queryFn: () => payrollApi.getEmployeeHistory(employee.id, 0, 12) })
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Financial Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div><p className="text-xs text-nexus-500 uppercase">Annual Salary</p><p className="text-sm text-white font-mono">₹{employee.salary?.toLocaleString()}</p></div>
          <div><p className="text-xs text-nexus-500 uppercase">Bank Name</p><p className="text-sm text-white">{employee.bankName || 'N/A'}</p></div>
          <div><p className="text-xs text-nexus-500 uppercase">Account Number</p><p className="text-sm text-white font-mono">{employee.bankAccountNumber || 'N/A'}</p></div>
          <div><p className="text-xs text-nexus-500 uppercase">PAN Number</p><p className="text-sm text-white font-mono">{employee.panNumber || 'N/A'}</p></div>
          <div><p className="text-xs text-nexus-500 uppercase">PF Number</p><p className="text-sm text-white font-mono">{employee.pfNumber || 'N/A'}</p></div>
          <div><p className="text-xs text-nexus-500 uppercase">UAN Number</p><p className="text-sm text-white font-mono">{employee.uanNumber || 'N/A'}</p></div>
          <div><p className="text-xs text-nexus-500 uppercase">ESI Number</p><p className="text-sm text-white font-mono">{employee.esiNumber || 'N/A'}</p></div>
        </div>
      </GlassCard>
      
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Payslips</h3>
        <div className="space-y-3">
          {payslips?.content?.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
              <div>
                <p className="font-medium text-white">{new Date(p.year, p.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-nexus-400">Net: ₹{p.netSalary.toLocaleString()}</p>
              </div>
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">{p.status}</span>
            </div>
          ))}
          {(!payslips?.content || payslips.content.length === 0) && <p className="text-sm text-nexus-400">No payslips generated.</p>}
        </div>
      </GlassCard>
    </div>
  )
}

export const AddressTab = ({ employee }: { employee: any }) => (
  <GlassCard className="p-6">
    <h3 className="text-lg font-semibold text-white mb-6">Address Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
        <p className="text-xs text-nexus-500 uppercase mb-2">Current Address</p>
        <p className="text-sm text-white">{employee.address || 'Not provided'}</p>
      </div>
      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
        <p className="text-xs text-nexus-500 uppercase mb-2">Permanent Address</p>
        <p className="text-sm text-white">{employee.permanentAddress || 'Not provided'}</p>
      </div>
    </div>
  </GlassCard>
)

export const PerformanceTab = ({ employeeId }: { employeeId: string }) => {
  const { data: reviews } = useQuery({ queryKey: ['reviews', employeeId], queryFn: () => performanceApi.getReviews({ employeeId }) })
  const { data: goals } = useQuery({ queryKey: ['goals', employeeId], queryFn: () => performanceApi.getGoals(employeeId) })
  
  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-accent-orange" /> Performance Goals
        </h3>
        <div className="space-y-4">
          {goals?.map((g: any) => (
            <div key={g.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-white">{g.title}</h4>
                  <p className="text-xs text-nexus-400 mt-1">Category: {g.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] uppercase font-semibold ${
                  g.status === 'COMPLETED' ? 'bg-success/20 text-success' : 'bg-accent-blue/20 text-accent-blue'
                }`}>
                  {g.status}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-accent-orange h-2 rounded-full" style={{ width: `${g.progressPercentage}%` }}></div>
              </div>
              <p className="text-xs text-right mt-1 text-nexus-400">{g.progressPercentage}% Completed</p>
            </div>
          ))}
          {(!goals || goals.length === 0) && <p className="text-sm text-nexus-400">No performance goals found.</p>}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-accent-violet" /> Appraisal History
        </h3>
        <div className="space-y-4">
          {reviews?.content?.map((r: any) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white">{r.reviewPeriod}</h4>
                  <p className="text-xs text-nexus-400 mt-1">Reviewer: {r.reviewerName}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-bold text-accent-violet">{r.overallRating?.toFixed(1) || 'N/A'}<span className="text-sm text-nexus-500">/5.0</span></span>
                  <span className="text-[10px] uppercase mt-1 bg-white/10 px-2 py-0.5 rounded">{r.status}</span>
                </div>
              </div>
            </div>
          ))}
          {(!reviews?.content || reviews.content.length === 0) && <p className="text-sm text-nexus-400">No appraisal history found.</p>}
        </div>
      </GlassCard>
    </div>
  )
}

export const SecurityTab = ({ employee }: { employee: any }) => (
  <GlassCard className="p-6">
    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
      <Shield className="h-5 w-5 text-danger" /> Account & Security
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div>
          <p className="text-xs text-nexus-500 uppercase">Account Status</p>
          <p className={`text-sm font-semibold mt-1 ${employee.hasUserAccount ? 'text-success' : 'text-nexus-500'}`}>
            {employee.hasUserAccount ? 'Active Login Enabled' : 'No Account Provisioned'}
          </p>
        </div>
        {employee.hasUserAccount && (
          <>
            <div>
              <p className="text-xs text-nexus-500 uppercase">Assigned Roles</p>
              <div className="flex gap-2 mt-1">
                {employee.roles?.map((r: string) => (
                  <span key={r} className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded-full">{r.replace('ROLE_', '')}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-nexus-500 uppercase">Last Login Time</p>
              <p className="text-sm text-white mt-1">{employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : 'Never logged in'}</p>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-nexus-500 uppercase">Multi-Factor Authentication (MFA)</p>
          <span className={`h-2.5 w-2.5 rounded-full ${employee.mfaEnabled ? 'bg-success ring-4 ring-success/20' : 'bg-danger ring-4 ring-danger/20'}`} />
        </div>
        <p className="text-sm text-white font-medium">{employee.mfaEnabled ? 'Enabled & Enforced' : 'Disabled'}</p>
        <p className="text-xs text-nexus-400 mt-2">MFA adds an extra layer of security requiring a time-based code on login.</p>
      </div>
    </div>
  </GlassCard>
)
