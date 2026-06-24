import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import LoadingScreen from '@/components/ui/LoadingScreen'
import HasPermission from '@/components/auth/HasPermission'
import GlassCard from '@/components/ui/GlassCard'
import { Wallet, Download, TrendingUp, Users, Loader2, FileText, CheckCircle2, Clock, CalendarDays, Activity, Search, Filter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { payrollApi } from '@/api/payroll'
import { useToastStore } from '@/store/toast'
import PageTransition from '@/components/animation/PageTransition'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import SalaryStructureModal from './components/SalaryStructureModal'
import { SalaryStructureRequest, SalaryStructureResponse } from '@/api/payroll'
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { FileDown, FileSpreadsheet, FileIcon, FileClock } from 'lucide-react'
import AuditLogsModal from '@/components/payroll/AuditLogsModal'

const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#f43f5e']

export default function PayrollPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [activeTab, setActiveTab] = useState<'MY_PAYSLIPS' | 'ADMIN_PAYROLL' | 'SALARY_STRUCTURES' | 'ANALYTICS'>('MY_PAYSLIPS')
  const isAdmin = user?.role === 'ADMIN'

  // Table State
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [department, setDepartment] = useState('ALL')
  const [page, setPage] = useState(0)
  const [sortColumn, setSortColumn] = useState('employeeName')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(0) // Reset to first page on search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDir('asc')
    }
  }

  // Salary Structure State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<SalaryStructureResponse | null>(null)

  // Fetch Salary Structures
  const { data: structures, isLoading: isLoadingStructures } = useQuery({
    queryKey: ['salaryStructures'],
    queryFn: payrollApi.getAllStructures,
    enabled: !!user?.employeeId && isAdmin && activeTab === 'SALARY_STRUCTURES',
  })

  // Fetch Audit Logs
  const { data: auditLogs, isLoading: isLoadingAuditLogs } = useQuery({
    queryKey: ['payrollAuditLogs', currentMonth, currentYear],
    queryFn: () => payrollApi.getAuditLogs(currentMonth, currentYear),
    enabled: !!user?.employeeId && isAdmin && activeTab === 'ADMIN_PAYROLL',
  })

  // Admin: Get Monthly Summary
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery({
    queryKey: ['payrollSummary', currentMonth, currentYear],
    queryFn: () => payrollApi.getMonthlySummary(currentMonth, currentYear),
    enabled: !!user?.employeeId && isAdmin && (activeTab === 'ADMIN_PAYROLL' || activeTab === 'ANALYTICS'),
  })

  // Admin: Get Analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['payrollAnalytics', currentMonth, currentYear],
    queryFn: () => payrollApi.getAnalytics(currentMonth, currentYear),
    enabled: !!user?.employeeId && isAdmin && activeTab === 'ANALYTICS',
  })

  // Admin: Search Payrolls for current month
  const { data: pagedPayrolls, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['searchMonthlyPayroll', currentMonth, currentYear, debouncedSearch, department, page, sortColumn, sortDir],
    queryFn: () => payrollApi.searchMonthlyPayroll(currentMonth, currentYear, debouncedSearch, department, page, 10, sortColumn, sortDir),
    enabled: !!user?.employeeId && isAdmin && activeTab === 'ADMIN_PAYROLL',
  })

  // Employee: Get My History
  const { data: myHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['payrollHistory', user?.employeeId],
    queryFn: () => payrollApi.getEmployeeHistory(user?.employeeId as string, 0, 12),
    enabled: !!user?.employeeId && activeTab === 'MY_PAYSLIPS',
  })

  // Mutations
  const processMutation = useMutation({
    mutationFn: () => payrollApi.batchProcessPayroll(currentMonth, currentYear),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyPayroll'] })
      addToast({ title: 'Payroll Processed', description: `Successfully processed payroll for ${data.length} employees.`, type: 'success' })
    },
    onError: (err: any) => {
      addToast({ title: 'Processing Failed', description: err?.response?.data?.message || 'Failed to process payroll.', type: 'error' })
    }
  })

  const markPaidMutation = useMutation({
    mutationFn: (payrollId: string) => payrollApi.markAsPaid(payrollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyPayroll'] })
      addToast({ title: 'Marked Paid', description: `Payroll marked as paid.`, type: 'success' })
    }
  })

  const downloadPayslipMutation = useMutation({
    mutationFn: (payrollId: string) => payrollApi.downloadPayslip(payrollId),
    onSuccess: () => {
      addToast({ title: 'Downloaded', description: `Payslip download started.`, type: 'success' })
    },
    onError: () => {
      addToast({ title: 'Download Failed', description: `Failed to download payslip.`, type: 'error' })
    }
  })

  const exportMutation = useMutation({
    mutationFn: (format: 'pdf' | 'excel' | 'csv' | 'bank-file') => payrollApi.exportMonthlyReport(currentMonth, currentYear, format),
    onSuccess: () => {
      addToast({ title: 'Exported', description: `Report export started.`, type: 'success' })
    },
    onError: () => {
      addToast({ title: 'Export Failed', description: `Failed to export report.`, type: 'error' })
    }
  })

  const approveMutation = useMutation({
    mutationFn: () => payrollApi.approveMonthlyPayroll(currentMonth, currentYear),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] })
      queryClient.invalidateQueries({ queryKey: ['searchMonthlyPayroll'] })
      queryClient.invalidateQueries({ queryKey: ['payrollAuditLogs'] })
      addToast({ title: 'Approved', description: msg, type: 'success' })
    },
    onError: (err: any) => addToast({ title: 'Approval Failed', description: err?.response?.data?.message || 'Failed', type: 'error' })
  })

  const lockMutation = useMutation({
    mutationFn: () => payrollApi.lockMonthlyPayroll(currentMonth, currentYear),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] })
      queryClient.invalidateQueries({ queryKey: ['searchMonthlyPayroll'] })
      queryClient.invalidateQueries({ queryKey: ['payrollAuditLogs'] })
      addToast({ title: 'Locked', description: msg, type: 'success' })
    },
    onError: (err: any) => addToast({ title: 'Locking Failed', description: err?.response?.data?.message || 'Failed', type: 'error' })
  })

  const unlockMutation = useMutation({
    mutationFn: () => payrollApi.unlockMonthlyPayroll(currentMonth, currentYear),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] })
      queryClient.invalidateQueries({ queryKey: ['searchMonthlyPayroll'] })
      queryClient.invalidateQueries({ queryKey: ['payrollAuditLogs'] })
      addToast({ title: 'Unlocked', description: msg, type: 'success' })
    },
    onError: (err: any) => addToast({ title: 'Unlocking Failed', description: err?.response?.data?.message || 'Failed', type: 'error' })
  })

  const reverseMutation = useMutation({
    mutationFn: (id: string) => payrollApi.reversePayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrollSummary'] })
      queryClient.invalidateQueries({ queryKey: ['searchMonthlyPayroll'] })
      queryClient.invalidateQueries({ queryKey: ['payrollAuditLogs'] })
      addToast({ title: 'Reversed', description: 'Payroll reversed successfully', type: 'success' })
    },
    onError: (err: any) => addToast({ title: 'Reversal Failed', description: err?.response?.data?.message || 'Failed to reverse', type: 'error' })
  })

  // Structure Mutations
  const createStructureMutation = useMutation({
    mutationFn: (data: SalaryStructureRequest) => payrollApi.createStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] })
      addToast({ title: 'Created', description: 'Salary structure created successfully', type: 'success' })
      setIsModalOpen(false)
    },
    onError: (err: any) => addToast({ title: 'Error', description: err?.response?.data?.message || 'Failed to create', type: 'error' })
  })

  const updateStructureMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: SalaryStructureRequest }) => payrollApi.updateStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] })
      addToast({ title: 'Updated', description: 'Salary structure updated successfully', type: 'success' })
      setIsModalOpen(false)
    },
    onError: (err: any) => addToast({ title: 'Error', description: err?.response?.data?.message || 'Failed to update', type: 'error' })
  })

  const deleteStructureMutation = useMutation({
    mutationFn: (id: string) => payrollApi.deleteStructure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] })
      addToast({ title: 'Deleted', description: 'Salary structure deleted successfully', type: 'success' })
    },
    onError: (err: any) => addToast({ title: 'Error', description: err?.response?.data?.message || 'Failed to delete', type: 'error' })
  })

  const handleSaveStructure = (data: SalaryStructureRequest) => {
    if (editingStructure) {
      updateStructureMutation.mutate({ id: editingStructure.id, data })
    } else {
      createStructureMutation.mutate(data)
    }
  }

  const handleRunPayroll = () => {
    if (confirm(`Are you sure you want to run batch payroll for ${getMonthName(currentMonth)} ${currentYear}?`)) {
      processMutation.mutate()
    }
  }

  const handleApprove = () => {
    if (confirm(`Are you sure you want to approve payroll for ${getMonthName(currentMonth)} ${currentYear}?`)) {
      approveMutation.mutate()
    }
  }

  const handleLock = () => {
    if (confirm(`Are you sure you want to lock payroll for ${getMonthName(currentMonth)} ${currentYear}? No further recalculations will be allowed.`)) {
      lockMutation.mutate()
    }
  }

  const handleUnlock = () => {
    if (confirm(`Are you sure you want to unlock payroll for ${getMonthName(currentMonth)} ${currentYear}? This will revert them to Approved status.`)) {
      unlockMutation.mutate()
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
  }
  
  const getMonthName = (m: number) => new Date(2000, m - 1).toLocaleString('default', { month: 'long' })

  const myPayslips = myHistory?.content || []
  const adminPayrolls = pagedPayrolls?.content || []

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Payroll & Compensation</h1>
          <p className="text-sm text-nexus-400 mt-1">Manage salaries, payslips, and compliance</p>
        </div>
        
        {isAdmin && activeTab === 'ADMIN_PAYROLL' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-white/10 active:scale-[0.98]"
            >
              <FileClock className="h-4 w-4 text-nexus-300" />
              View Audit Logs
            </button>
            
            {/* Dynamic Lifecycle Actions based on summary state */}
            {summary && summary.totalEmployeesProcessed === 0 && (
              <button 
                onClick={handleRunPayroll}
                disabled={processMutation.isPending}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-indigo to-accent-violet px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-indigo/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {processMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Process Monthly Payroll
              </button>
            )}

            {summary && summary.totalEmployeesProcessed > 0 && summary.totalEmployeesProcessed > summary.totalApproved && (
              <button 
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Approve Payroll
              </button>
            )}

            {summary && summary.totalApproved > 0 && summary.totalApproved > summary.totalLocked && (
              <button 
                onClick={handleLock}
                disabled={lockMutation.isPending}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-warning px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-warning/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {lockMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Lock Payroll
              </button>
            )}

            {summary && summary.totalLocked > 0 && (
              <button 
                onClick={handleUnlock}
                disabled={unlockMutation.isPending}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-danger/10 border border-danger/20 text-danger px-4 py-2.5 text-sm font-semibold transition-all hover:bg-danger/20 active:scale-[0.98] disabled:opacity-50"
              >
                {unlockMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                Unlock Payroll
              </button>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-4 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('MY_PAYSLIPS')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'MY_PAYSLIPS' ? 'border-accent-indigo text-white' : 'border-transparent text-nexus-400 hover:text-nexus-200'}`}
          >
            My Payslips
          </button>
          <button
            onClick={() => setActiveTab('ADMIN_PAYROLL')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ADMIN_PAYROLL' ? 'border-accent-indigo text-white' : 'border-transparent text-nexus-400 hover:text-nexus-200'}`}
          >
            Company Payroll
          </button>
          <button
            onClick={() => setActiveTab('SALARY_STRUCTURES')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'SALARY_STRUCTURES' ? 'border-accent-indigo text-white' : 'border-transparent text-nexus-400 hover:text-nexus-200'}`}
          >
            Salary Structures
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ANALYTICS' ? 'border-accent-indigo text-white' : 'border-transparent text-nexus-400 hover:text-nexus-200'}`}
          >
            <div className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Analytics</div>
          </button>
        </div>
      )}

      {/* ADMIN VIEW */}
      {isAdmin && activeTab === 'ADMIN_PAYROLL' && (
        <div className="space-y-6">
          {isErrorSummary ? (
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-6 text-center text-danger shadow-sm">
              <p className="font-semibold">Failed to load payroll summary</p>
              <p className="text-sm mt-1 opacity-80">Please ensure the backend is running.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoadingSummary ? (
                [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              ) : (
                <>
                  <GlassCard className="p-5" delay={0.05}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nexus-400 uppercase tracking-wider">Total Payroll Cost</p>
                        <p className="text-2xl font-bold mt-1 text-white">{formatCurrency(summary?.totalGrossSalary || 0)}</p>
                      </div>
                      <Wallet className="h-5 w-5 text-accent-indigo opacity-40" />
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-5" delay={0.1}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nexus-400 uppercase tracking-wider">Employees Processed</p>
                        <p className="text-2xl font-bold mt-1 text-success">{summary?.totalEmployeesProcessed || 0}</p>
                      </div>
                      <Users className="h-5 w-5 text-success opacity-40" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5" delay={0.15}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nexus-400 uppercase tracking-wider">Pending Payroll Runs</p>
                        <p className="text-2xl font-bold mt-1 text-warning">{summary?.totalPending || 0}</p>
                      </div>
                      <Clock className="h-5 w-5 text-warning opacity-40" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5" delay={0.2}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nexus-400 uppercase tracking-wider">Current Payroll Cycle</p>
                        <p className="text-2xl font-bold mt-1 text-white">{summary?.currentPayrollCycle || '-'}</p>
                      </div>
                      <Activity className="h-5 w-5 text-accent-blue opacity-40" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5" delay={0.25}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nexus-400 uppercase tracking-wider">Next Payroll Date</p>
                        <p className="text-2xl font-bold mt-1 text-accent-cyan">{summary?.nextPayrollDate || '-'}</p>
                      </div>
                      <CalendarDays className="h-5 w-5 text-accent-cyan opacity-40" />
                    </div>
                  </GlassCard>

                  <GlassCard className="p-5" delay={0.3}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-nexus-400 uppercase tracking-wider">Average Salary</p>
                        <p className="text-2xl font-bold mt-1 text-accent-violet">{formatCurrency(summary?.averageSalary || 0)}</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-accent-violet opacity-40" />
                    </div>
                  </GlassCard>
                </>
              )}
            </div>
          )}

          {/* AUDIT LOG TIMELINE */}
          {auditLogs && auditLogs.length > 0 && (
            <div className="mt-8 mb-4">
              <h3 className="text-sm font-semibold text-white mb-4">Lifecycle Audit Trail</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {auditLogs.map((log, idx) => (
                  <div key={log.id} className="min-w-[280px] p-4 snap-start border-l-4 rounded-xl border border-white/5 bg-nexus-900/20" style={{
                    borderLeftColor: 
                      log.action === 'BATCH_PROCESSED' ? 'var(--color-accent-indigo)' :
                      log.action === 'BATCH_APPROVED' ? 'var(--color-accent-blue)' :
                      log.action === 'BATCH_LOCKED' ? 'var(--color-warning)' :
                      log.action === 'BATCH_UNLOCKED' ? 'var(--color-danger)' : 'var(--color-nexus-500)'
                  }}>
                    <div className="text-[10px] text-nexus-400 font-mono mb-1">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="text-sm font-bold text-white mb-1">{log.action.replace('BATCH_', '')}</div>
                    <div className="text-xs text-nexus-300">{log.details}</div>
                    <div className="text-[10px] text-nexus-500 mt-2 flex items-center gap-1">
                      <Users className="h-3 w-3" /> By {log.actionBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <GlassCard className="overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <h3 className="text-sm font-semibold text-white whitespace-nowrap">Monthly Payroll Records ({getMonthName(currentMonth)} {currentYear})</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {/* Export Buttons */}
                <div className="flex bg-[#11111a] border border-white/10 rounded-lg overflow-hidden shrink-0">
                  <button 
                    onClick={() => exportMutation.mutate('pdf')}
                    disabled={exportMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-nexus-300 hover:bg-white/[0.05] hover:text-white transition-colors border-r border-white/10"
                    title="Export as PDF"
                  >
                    <FileIcon className="h-3.5 w-3.5 text-[#e11d48]" /> PDF
                  </button>
                  <button 
                    onClick={() => exportMutation.mutate('excel')}
                    disabled={exportMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-nexus-300 hover:bg-white/[0.05] hover:text-white transition-colors border-r border-white/10"
                    title="Export as Excel"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#16a34a]" /> Excel
                  </button>
                  <button 
                    onClick={() => exportMutation.mutate('csv')}
                    disabled={exportMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-nexus-300 hover:bg-white/[0.05] hover:text-white transition-colors border-r border-white/10"
                    title="Export as CSV"
                  >
                    <FileDown className="h-3.5 w-3.5 text-accent-indigo" /> CSV
                  </button>
                  <button 
                    onClick={() => {
                      // Call the specific exportBankFile via API
                      window.open(`${payrollApi.exportBankFile(currentMonth, currentYear)}`, '_blank')
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-nexus-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                    title="Export Bank File"
                  >
                    <Wallet className="h-3.5 w-3.5 text-warning" /> Bank File
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-500" />
                  <input 
                    type="text" 
                    placeholder="Search name or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-nexus-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all"
                  />
                </div>
                <div className="relative w-full sm:w-48">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-500" />
                  <select
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
                    className="w-full bg-[#11111a] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-accent-indigo transition-all appearance-none"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      { key: 'employeeName', label: 'Employee Name' },
                      { key: 'employeeCode', label: 'Employee ID' },
                      { key: 'departmentName', label: 'Department' },
                      { key: 'basicSalary', label: 'Basic Salary' },
                      { key: 'totalDeductions', label: 'Deductions' },
                      { key: 'bonus', label: 'Bonus' },
                      { key: 'netSalary', label: 'Net Salary' },
                      { key: 'status', label: 'Status' },
                      { key: 'actions', label: 'Actions', sortable: false }
                    ].map(col => (
                      <TableHead 
                        key={col.key} 
                        onClick={() => col.sortable !== false && handleSort(col.key)}
                        className={col.sortable !== false ? "cursor-pointer hover:bg-white/[0.02] transition-colors select-none" : ""}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {col.sortable !== false && sortColumn === col.key && (
                            sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-accent-indigo" /> : <ArrowDown className="h-3 w-3 text-accent-indigo" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingMonthly ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12"><Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" /></TableCell></TableRow>
                  ) : adminPayrolls.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12 text-sm text-nexus-400">No payroll records match your criteria.</TableCell></TableRow>
                  ) : adminPayrolls.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-white">{record.employeeName}</TableCell>
                      <TableCell className="text-xs text-nexus-400 font-mono">{record.employeeId?.substring(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="text-sm text-nexus-300">{record.department}</TableCell>
                      <TableCell className="text-sm text-nexus-300">{formatCurrency(record.basicSalary)}</TableCell>
                      <TableCell className="text-sm text-danger">{formatCurrency(record.totalDeductions)}</TableCell>
                      <TableCell className="text-sm text-success">{formatCurrency(record.bonus)}</TableCell>
                      <TableCell className="font-bold text-success">{formatCurrency(record.netSalary)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                          record.status === 'PAID' ? 'text-success border-success/20 bg-success/10' :
                          record.status === 'APPROVED' ? 'text-accent-blue border-accent-blue/20 bg-accent-blue/10' :
                          record.status === 'FAILED' ? 'text-danger border-danger/20 bg-danger/10' :
                          record.status === 'REVERSED' ? 'text-warning border-warning/20 bg-warning/10' :
                          'text-nexus-400 border-white/10 bg-white/5'
                        }`}>
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadPayslipMutation.mutate(record.id)}
                            disabled={downloadPayslipMutation.isPending && downloadPayslipMutation.variables === record.id}
                            className="p-1.5 text-nexus-400 hover:text-accent-indigo hover:bg-accent-indigo/10 rounded transition-colors"
                            title="Download Payslip"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {record.status === 'APPROVED' && (
                            <HasPermission category="PAYROLL" action="APPROVE">
                              <button
                                onClick={() => markPaidMutation.mutate(record.id)}
                                disabled={markPaidMutation.isPending && markPaidMutation.variables === record.id}
                                className="px-2 py-1 text-xs font-medium bg-success/10 text-success hover:bg-success/20 rounded transition-colors"
                              >
                                Mark Paid
                              </button>
                            </HasPermission>
                          )}
                          {(record.status === 'PAID' || record.status === 'APPROVED') && (
                            <HasPermission category="PAYROLL" action="EDIT">
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to reverse this payroll?')) {
                                    reverseMutation.mutate(record.id)
                                  }
                                }}
                                disabled={reverseMutation.isPending && reverseMutation.variables === record.id}
                                className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 rounded transition-colors"
                                title="Reverse Payroll"
                              >
                                Reverse
                              </button>
                            </HasPermission>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {pagedPayrolls && pagedPayrolls.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <p className="text-xs text-nexus-400">
                    Showing <span className="font-medium text-white">{page * 10 + 1}</span> to <span className="font-medium text-white">{Math.min((page + 1) * 10, pagedPayrolls.totalElements)}</span> of <span className="font-medium text-white">{pagedPayrolls.totalElements}</span> results
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1.5 rounded-lg border border-white/10 text-nexus-300 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagedPayrolls.totalPages - 1, p + 1))}
                      disabled={page >= pagedPayrolls.totalPages - 1}
                      className="p-1.5 rounded-lg border border-white/10 text-nexus-300 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* SALARY STRUCTURES VIEW */}
      {isAdmin && activeTab === 'SALARY_STRUCTURES' && (
        <div className="space-y-6">
          <GlassCard className="overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Defined Salary Structures</h3>
              <button
                onClick={() => {
                  setEditingStructure(null)
                  setIsModalOpen(true)
                }}
                className="px-4 py-2 text-xs font-semibold bg-accent-indigo text-white rounded-lg hover:bg-accent-indigo/90 transition-colors"
              >
                Create Structure
              </button>
            </div>
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Structure Name</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Percentages (HRA/DA/PF)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStructures ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" /></TableCell></TableRow>
                  ) : structures?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-sm text-nexus-400">No structures defined.</TableCell></TableRow>
                  ) : structures?.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium text-white">{s.name}</div>
                        {s.description && <div className="text-xs text-nexus-400">{s.description}</div>}
                      </TableCell>
                      <TableCell className="text-sm text-nexus-300">{formatCurrency(s.basicSalary)}</TableCell>
                      <TableCell className="text-sm text-nexus-300">{formatCurrency(s.otherAllowances)}</TableCell>
                      <TableCell className="text-xs text-nexus-400">
                        HRA: {s.hraPercentage}% | DA: {s.daPercentage}% | PF: {s.pfPercentage}%
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                          s.active ? 'text-success border-success/20 bg-success/10' : 'text-nexus-400 border-white/10 bg-white/5'
                        }`}>
                          {s.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingStructure(s); setIsModalOpen(true); }}
                            className="px-2 py-1 text-xs font-medium bg-accent-indigo/10 text-accent-indigo hover:bg-accent-indigo/20 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this structure?')) {
                                deleteStructureMutation.mutate(s.id)
                              }
                            }}
                            className="px-2 py-1 text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* EMPLOYEE VIEW */}
      {activeTab === 'MY_PAYSLIPS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingHistory ? (
               <div className="col-span-full flex justify-center py-12"><Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" /></div>
            ) : myPayslips.length === 0 ? (
               <div className="col-span-full py-12 text-center text-nexus-400">No payslips generated yet.</div>
            ) : myPayslips.map((slip, i) => (
              <GlassCard key={slip.id} className="p-5 flex flex-col gap-4" delay={i * 0.05}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent-indigo/10 flex items-center justify-center border border-accent-indigo/20">
                      <FileText className="h-5 w-5 text-accent-indigo" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-nexus-50">{getMonthName(slip.month)} {slip.year}</h4>
                      <p className="text-xs text-nexus-400">Issued: {slip.processedAt ? new Date(slip.processedAt).toLocaleDateString() : 'Pending'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${slip.status === 'PAID' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                    {slip.status}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-nexus-500 uppercase tracking-wider mb-1">Net Pay</p>
                    <p className="text-xl font-bold text-success">{formatCurrency(slip.netSalary)}</p>
                  </div>
                  <button
                    onClick={() => downloadPayslipMutation.mutate(slip.id)}
                    disabled={downloadPayslipMutation.isPending && downloadPayslipMutation.variables === slip.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent-indigo hover:bg-accent-indigo/10 rounded transition-colors"
                  >
                    {downloadPayslipMutation.isPending && downloadPayslipMutation.variables === slip.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download PDF
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {isAdmin && activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {isLoadingAnalytics ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-accent-indigo animate-spin" /></div>
          ) : !analytics ? (
            <div className="text-center py-12 text-nexus-400">No analytics data available for this month.</div>
          ) : (
            <>
              {/* Monthly Cost Trend */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">6-Month Cost Trend</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyCosts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        stroke="#9ca3af" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [formatCurrency(value), 'Cost']}
                      />
                      <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Distribution */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Department Breakdown</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.departmentCosts}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="cost"
                          nameKey="department"
                        >
                          {analytics.departmentCosts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* Salary Distribution */}
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Salary Distribution</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.salaryDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          formatter={(value: number) => [value, 'Employees']}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {analytics.salaryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>
            </>
          )}
        </div>
      )}
      {/* Modals */}
      <SalaryStructureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingStructure}
        onSave={handleSaveStructure}
        isSaving={createStructureMutation.isPending || updateStructureMutation.isPending}
      />
      {isAuditModalOpen && (
        <AuditLogsModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          month={currentMonth}
          year={currentYear}
        />
      )}
    </PageTransition>
  )
}
