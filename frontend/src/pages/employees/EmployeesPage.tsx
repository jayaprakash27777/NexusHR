import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import GlassCard from '@/components/ui/GlassCard'
import AdvancedFilters, { type FilterOption } from '@/components/ui/AdvancedFilters'
import SavedViews from '@/components/ui/SavedViews'
import BulkOperationsToolbar from '@/components/ui/BulkOperationsToolbar'
import SmartEmptyState from '@/components/ui/SmartEmptyState'
import PageTransition from '@/components/animation/PageTransition'
import { employeesApi, type Employee, type CreateEmployeeRequest } from '@/api/employees'
import { toast } from '@/store/toast'
import {
  Users, Search, Plus, MoreHorizontal, Mail, Phone, Download,
  ChevronLeft, ChevronRight, Loader2, X, AlertCircle, Grid, List
} from 'lucide-react'
import HasPermission from '@/components/auth/HasPermission'

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  ON_NOTICE: 'bg-warning/10 text-warning border-warning/20',
  TERMINATED: 'bg-danger/10 text-danger border-danger/20',
  INACTIVE: 'bg-nexus-800 text-nexus-400 border-white/10',
}

const filterConfig: FilterOption[] = [
  {
    id: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'sales', label: 'Sales' },
      { value: 'finance', label: 'Finance' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'HR' },
    ]
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'ON_NOTICE', label: 'On Notice' },
      { value: 'TERMINATED', label: 'Terminated' },
    ]
  },
  {
    id: 'employmentType',
    label: 'Employment Type',
    type: 'select',
    options: [
      { value: 'FULL_TIME', label: 'Full Time' },
      { value: 'PART_TIME', label: 'Part Time' },
      { value: 'CONTRACT', label: 'Contract' },
      { value: 'INTERN', label: 'Intern' },
    ]
  }
]

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Partial<CreateEmployeeRequest>>({
    employmentType: 'FULL_TIME',
  })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: employeesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Employee Created', `${data.fullName} has been added to the system.`)
      onClose()
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to create employee. Please check the form.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.designation || !form.departmentId || !form.dateOfJoining) {
      setError('Please fill in all required fields.')
      return
    }
    mutation.mutate(form as CreateEmployeeRequest)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-nexus-900 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-nexus-50">Add New Employee</h2>
            <p className="text-sm text-nexus-400 mt-0.5">Create a new employee record in the system</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-nexus-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">First Name *</label>
              <input
                required type="text" value={form.firstName || ''}
                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Last Name *</label>
              <input
                required type="text" value={form.lastName || ''}
                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Work Email *</label>
            <input
              required type="email" value={form.email || ''}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              placeholder="john.doe@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Designation *</label>
              <input
                required type="text" value={form.designation || ''}
                onChange={(e) => setForm(f => ({ ...f, designation: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                placeholder="Senior Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Department ID *</label>
              <input
                required type="text" value={form.departmentId || ''}
                onChange={(e) => setForm(f => ({ ...f, departmentId: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                placeholder="dept-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Date of Joining *</label>
              <input
                required type="date" value={form.dateOfJoining || ''}
                onChange={(e) => setForm(f => ({ ...f, dateOfJoining: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Employment Type *</label>
              <select
                value={form.employmentType || 'FULL_TIME'}
                onChange={(e) => setForm(f => ({ ...f, employmentType: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Phone</label>
              <input
                type="tel" value={form.phone || ''}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Base Salary (₹/year)</label>
              <input
                type="number" value={form.salary || ''}
                onChange={(e) => setForm(f => ({ ...f, salary: parseFloat(e.target.value) || undefined }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                placeholder="1200000"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-danger flex-shrink-0" />
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-nexus-300 hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent-indigo text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Employee
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const debouncedSearch = useDebounce(searchTerm, 350)

  // Build query params from filters
  const queryParams = {
    page,
    size: 18,
    search: debouncedSearch || undefined,
    department: activeFilters['department']?.[0],
    status: activeFilters['status']?.[0],
    employmentType: activeFilters['employmentType']?.[0],
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employees', queryParams],
    queryFn: () => employeesApi.getAll(queryParams),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Employee Deleted', 'The employee record has been removed.')
      setSelectedIds(new Set())
    },
  })

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleExport = async () => {
    try {
      const blob = await employeesApi.export('csv')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export Complete', 'Employee data has been downloaded.')
    } catch {
      toast.error('Export Failed', 'Unable to export employee data.')
    }
  }

  const handleBulkDelete = () => {
    if (!selectedIds.size) return
    selectedIds.forEach(id => deleteMutation.mutate(id))
  }

  const employees = data?.content ?? []
  const isEmpty = !isLoading && employees.length === 0

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Employees Directory</h1>
          <p className="text-sm text-nexus-400 mt-1">
            {data?.totalElements !== undefined ? `${data.totalElements} total employees` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-300 hover:bg-white/10 transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <HasPermission category="EMPLOYEE" action="CREATE">
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-indigo to-accent-violet px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-indigo/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" /> Add Employee
            </motion.button>
          </HasPermission>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-white/5 bg-white/[0.02] p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0) }}
              placeholder="Search name, email, role..."
              className="w-full rounded-lg bg-black/20 py-1.5 pl-9 pr-3 text-sm text-nexus-100 placeholder-nexus-600 outline-none focus:ring-1 focus:ring-accent-indigo"
            />
          </div>
          <AdvancedFilters
            availableFilters={filterConfig}
            activeFilters={activeFilters}
            onFilterChange={(f) => { setActiveFilters(f); setPage(0) }}
          />
        </div>
        <div className="flex items-center gap-3">
          <SavedViews currentFilters={activeFilters} onApplyView={(f) => { setActiveFilters(f); setPage(0) }} />
          <div className="hidden sm:flex items-center rounded-lg bg-black/20 p-1 border border-white/5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-nexus-500 hover:text-nexus-300'}`}
              aria-label="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-nexus-500 hover:text-nexus-300'}`}
              aria-label="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-10 w-10 text-danger" />
          <p className="text-nexus-300">Failed to load employees. Ensure the backend is running.</p>
        </div>
      ) : isEmpty ? (
        <SmartEmptyState
          icon={Users}
          title="No employees found"
          description="No employees match your current search or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => { setActiveFilters({}); setSearchTerm(''); setPage(0) }}
          className="py-20"
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {employees.map((emp: Employee, i: number) => {
                const isSelected = selectedIds.has(emp.id)
                const initials = emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <GlassCard
                    key={emp.id}
                    className={`p-5 group cursor-pointer transition-all duration-300 relative ${isSelected ? 'ring-2 ring-accent-indigo/50 bg-accent-indigo/5' : ''}`}
                    delay={i * 0.03}
                    glow="indigo"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-white/20 bg-black/20 text-accent-indigo focus:ring-accent-indigo focus:ring-offset-black/20"
                        checked={isSelected}
                        onChange={() => toggleSelection(emp.id)}
                      />
                    </div>
                    <div className="flex items-start justify-between mb-4 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10">
                          <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 text-sm font-semibold text-nexus-200 ring-2 ring-white/[0.06] transition-opacity`}>
                            {initials}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-nexus-100 group-hover:text-nexus-50 transition-colors">{emp.fullName}</h3>
                          <p className="text-xs text-nexus-500">{emp.employeeId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-nexus-300">{emp.designation}</p>
                      <p className="text-xs text-nexus-500">{emp.departmentName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusColors[emp.status] ?? 'bg-nexus-800 text-nexus-400 border-white/10'}`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                      <div className="flex gap-2">
                        <a href={`mailto:${emp.email}`} className="text-nexus-600 hover:text-accent-indigo transition-colors" aria-label="Email" onClick={e => e.stopPropagation()}>
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                        {emp.phone && (
                          <a href={`tel:${emp.phone}`} className="text-nexus-600 hover:text-accent-indigo transition-colors" aria-label="Phone" onClick={e => e.stopPropagation()}>
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-white/5 bg-nexus-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-nexus-300">
                  <thead className="bg-white/[0.02] text-xs uppercase text-nexus-400">
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-white/20 bg-black/20 text-accent-indigo focus:ring-accent-indigo focus:ring-offset-black/20"
                          checked={selectedIds.size === employees.length && employees.length > 0}
                          onChange={() => {
                            if (selectedIds.size === employees.length) {
                              setSelectedIds(new Set())
                            } else {
                              setSelectedIds(new Set(employees.map((e: Employee) => e.id)))
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Employee</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((emp: Employee, i: number) => {
                      const isSelected = selectedIds.has(emp.id)
                      const initials = emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      return (
                        <motion.tr 
                          key={emp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${isSelected ? 'bg-accent-indigo/5' : ''}`}
                          onClick={() => navigate(`/employees/${emp.id}`)}
                        >
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded border-white/20 bg-black/20 text-accent-indigo focus:ring-accent-indigo focus:ring-offset-black/20"
                              checked={isSelected}
                              onChange={() => toggleSelection(emp.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 text-xs font-semibold text-nexus-200 ring-1 ring-white/[0.06]">
                                {initials}
                              </div>
                              <div>
                                <div className="font-medium text-nexus-100">{emp.fullName}</div>
                                <div className="text-xs text-nexus-500">{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-nexus-300">{emp.designation}</td>
                          <td className="px-4 py-3 text-nexus-400">{emp.departmentName}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusColors[emp.status] ?? 'bg-nexus-800 text-nexus-400 border-white/10'}`}>
                              {emp.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-nexus-500 hover:text-white transition-colors p-1" onClick={e => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={data?.first}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-nexus-300 hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-sm text-nexus-400">
                Page {(data?.number ?? 0) + 1} of {data?.totalPages ?? 1}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={data?.last}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-nexus-300 hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <BulkOperationsToolbar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onApprove={() => {}}
        onDelete={handleBulkDelete}
        onExport={handleExport}
      />

      <AnimatePresence>
        {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </PageTransition>
  )
}
