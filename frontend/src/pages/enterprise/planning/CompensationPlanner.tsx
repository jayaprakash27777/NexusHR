import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, AlertCircle, Save, ChevronDown, 
  Percent, ArrowRight, BarChart2, ShieldAlert
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

interface EmployeeComp {
  id: string
  name: string
  role: string
  department: string
  currentSalary: number
  compBand: [number, number] // [min, max]
  compaRatio: number
  proposedIncrease: number
  proposedBonus: number
  performanceScore: number
}

const mockCompData: EmployeeComp[] = [
  { id: '1', name: 'Sarah Jenkins', role: 'VP Engineering', department: 'Engineering', currentSalary: 240000, compBand: [200000, 280000], compaRatio: 1.0, proposedIncrease: 5.0, proposedBonus: 40000, performanceScore: 4.8 },
  { id: '2', name: 'Mike Ross', role: 'Eng Manager', department: 'Engineering', currentSalary: 160000, compBand: [150000, 210000], compaRatio: 0.88, proposedIncrease: 12.0, proposedBonus: 20000, performanceScore: 4.9 },
  { id: '3', name: 'Elena Rodriguez', role: 'Finance Director', department: 'Finance', currentSalary: 185000, compBand: [160000, 220000], compaRatio: 0.97, proposedIncrease: 4.0, proposedBonus: 25000, performanceScore: 4.2 },
  { id: '4', name: 'David Chen', role: 'Account Executive', department: 'Sales', currentSalary: 110000, compBand: [100000, 150000], compaRatio: 0.88, proposedIncrease: 8.0, proposedBonus: 50000, performanceScore: 4.5 }
]

export default function CompensationPlanner() {
  const [data, setData] = useState<EmployeeComp[]>(mockCompData)
  const [budget] = useState(450000)

  const calculateTotalIncrease = () => {
    return data.reduce((sum, emp) => sum + (emp.currentSalary * (emp.proposedIncrease / 100)), 0)
  }

  const calculateTotalBonus = () => {
    return data.reduce((sum, emp) => sum + emp.proposedBonus, 0)
  }

  const handleUpdate = (id: string, field: 'proposedIncrease' | 'proposedBonus', value: number) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const handleSave = () => {
    toast.success('Merit Cycle Saved', 'Your proposed compensation adjustments have been saved for HR review.')
  }

  const totalSpend = calculateTotalIncrease() + calculateTotalBonus()
  const isOverBudget = totalSpend > budget

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-success" />
            Compensation Planning
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Manage merit cycles, analyze pay parity, and propose compensation adjustments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors">
            <BarChart2 className="h-4 w-4" /> Pay Equity Analysis
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-success/20 transition-all hover:bg-emerald-500">
            <Save className="h-4 w-4" /> Submit Proposals
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-6">
        
        {/* Budget Dashboard */}
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium text-nexus-400 uppercase tracking-wider mb-2">Total Allocated Budget</h3>
              <div className="text-3xl font-bold text-white">${budget.toLocaleString()}</div>
            </div>
            <div className="md:col-span-3 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-nexus-300">
                  <span className={isOverBudget ? 'text-danger font-bold' : 'text-success font-bold'}>
                    ${totalSpend.toLocaleString()}
                  </span> utilized
                </div>
                <div className="text-sm font-medium text-nexus-400">
                  ${Math.abs(budget - totalSpend).toLocaleString()} {isOverBudget ? 'over' : 'remaining'}
                </div>
              </div>
              <div className="h-3 w-full bg-nexus-900 rounded-full overflow-hidden border border-white/10 flex">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(calculateTotalIncrease() / budget) * 100}%` }}
                  className="h-full bg-accent-indigo"
                />
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(calculateTotalBonus() / budget) * 100}%` }}
                  className={`h-full ${isOverBudget ? 'bg-danger' : 'bg-success'}`}
                />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs font-medium text-nexus-400">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-indigo" /> Base Salary Increases</div>
                <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${isOverBudget ? 'bg-danger' : 'bg-success'}`} /> Bonuses</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Data Grid */}
        <GlassCard className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-nexus-50">FY2026 Merit Adjustments</h2>
            <div className="flex gap-2">
              <select className="rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-1.5 text-sm text-nexus-200 focus:outline-none">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>Sales</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-w-[1000px]">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-nexus-500">
                <div className="col-span-3">Employee</div>
                <div className="col-span-1 text-center">Perf. Score</div>
                <div className="col-span-2 text-right">Current Salary</div>
                <div className="col-span-2">Compa-Ratio / Band</div>
                <div className="col-span-2 text-center">Proposed Incr. (%)</div>
                <div className="col-span-2 text-center">Proposed Bonus</div>
              </div>

              {/* Rows */}
              <div className="space-y-4 pt-4">
                {data.map(emp => {
                  const bandMidpoint = (emp.compBand[0] + emp.compBand[1]) / 2;
                  const ratio = emp.currentSalary / bandMidpoint;
                  const newSalary = emp.currentSalary * (1 + (emp.proposedIncrease / 100));

                  return (
                    <div key={emp.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-colors">
                      <div className="col-span-3">
                        <div className="font-bold text-nexus-50">{emp.name}</div>
                        <div className="text-xs text-nexus-400">{emp.role} • {emp.department}</div>
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                          emp.performanceScore >= 4.5 ? 'bg-success/20 text-success border border-success/30' :
                          emp.performanceScore >= 3.5 ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30' :
                          'bg-warning/20 text-warning border border-warning/30'
                        }`}>
                          {emp.performanceScore.toFixed(1)}
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-medium text-nexus-200">
                        ${emp.currentSalary.toLocaleString()}
                        <div className="text-xs text-success flex items-center justify-end gap-1 mt-0.5">
                          <ArrowRight className="h-3 w-3" /> ${newSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      <div className="col-span-2 px-4">
                        <div className="flex justify-between text-[10px] text-nexus-400 mb-1 font-mono">
                          <span>${(emp.compBand[0]/1000).toFixed(0)}k</span>
                          <span>${(emp.compBand[1]/1000).toFixed(0)}k</span>
                        </div>
                        <div className="h-1.5 w-full bg-nexus-900 rounded-full relative">
                          <div 
                            className={`absolute top-0 bottom-0 w-1.5 rounded-full -translate-x-1/2 shadow-[0_0_5px_currentColor] ${
                              ratio < 0.9 ? 'bg-warning text-warning' : ratio > 1.1 ? 'bg-danger text-danger' : 'bg-success text-success'
                            }`}
                            style={{ left: `${((emp.currentSalary - emp.compBand[0]) / (emp.compBand[1] - emp.compBand[0])) * 100}%` }}
                          />
                        </div>
                        <div className={`text-[10px] text-center mt-1 font-bold ${
                           ratio < 0.9 ? 'text-warning' : ratio > 1.1 ? 'text-danger' : 'text-success'
                        }`}>
                          {(ratio * 100).toFixed(0)}% CR
                          {ratio < 0.9 && <ShieldAlert className="h-3 w-3 inline ml-1" />}
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <div className="relative w-24">
                          <input 
                            type="number"
                            value={emp.proposedIncrease}
                            onChange={(e) => handleUpdate(emp.id, 'proposedIncrease', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-white/10 bg-nexus-900/80 px-3 py-1.5 text-sm text-center text-white focus:border-accent-indigo focus:outline-none pr-6"
                          />
                          <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-nexus-500 pointer-events-none" />
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <div className="relative w-32">
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nexus-500 pointer-events-none" />
                          <input 
                            type="number"
                            value={emp.proposedBonus}
                            onChange={(e) => handleUpdate(emp.id, 'proposedBonus', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-white/10 bg-nexus-900/80 pl-6 pr-3 py-1.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </PageTransition>
  )
}
