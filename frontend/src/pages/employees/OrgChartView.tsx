import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Building2, User } from 'lucide-react'
import { Employee } from '@/api/employees'
import { useNavigate } from 'react-router-dom'

interface OrgNode extends Employee {
  children: OrgNode[]
}

export default function OrgChartView({ employees }: { employees: Employee[] }) {
  const navigate = useNavigate()

  // Build the tree
  const tree = useMemo(() => {
    const map = new Map<string, OrgNode>()
    const roots: OrgNode[] = []

    employees.forEach(emp => {
      map.set(emp.id, { ...emp, children: [] })
    })

    employees.forEach(emp => {
      const node = map.get(emp.id)!
      if (emp.managerId && map.has(emp.managerId)) {
        map.get(emp.managerId)!.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }, [employees])

  const renderNode = (node: OrgNode) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(`/employees/${node.id}`)}
          className="relative z-10 flex w-64 cursor-pointer flex-col items-center rounded-xl border border-border bg-surface p-4 shadow-lg transition-colors hover:border-accent-indigo hover:bg-surface-hover"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo to-accent-violet text-lg font-bold text-white shadow-inner">
            {node.firstName[0]}{node.lastName[0]}
          </div>
          <h3 className="text-sm font-bold text-foreground">{node.fullName}</h3>
          <p className="text-xs text-muted">{node.designation}</p>
          <div className="mt-2 flex items-center justify-center gap-1 rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted border border-border">
            <Building2 className="h-3 w-3" />
            {node.departmentName}
          </div>
        </motion.div>

        {/* Children Container */}
        {node.children.length > 0 && (
          <div className="relative mt-8 flex gap-8 pt-8">
            {/* Top vertical line connecting parent to horizontal bar */}
            <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-border" />
            
            {/* Horizontal connecting bar if multiple children */}
            {node.children.length > 1 && (
              <div 
                className="absolute top-8 h-px bg-border" 
                style={{
                  left: `calc(50% / ${node.children.length})`, // approximation, usually done via padding
                  right: `calc(50% / ${node.children.length})`,
                  width: 'calc(100% - 16rem)' // Simplified horizontal line trick
                }} 
              />
            )}
            
            {/* Horizontal line trick: use a full width bar across the container, but restrict it via first/last child pseudo elements or just absolute positioning */}
            {node.children.length > 1 && (
              <div className="absolute top-8 left-0 right-0 h-px bg-transparent">
                 <div className="mx-auto h-full bg-border" style={{ width: `calc(100% - ${100 / node.children.length}%)` }}></div>
              </div>
            )}

            {node.children.map((child, index) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical line connecting horizontal bar to child */}
                <div className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-border" />
                {renderNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!employees.length) return null

  return (
    <div className="w-full overflow-auto rounded-xl border border-border bg-surface/30 p-8 custom-scrollbar min-h-[600px] flex justify-center">
      <div className="min-w-max pb-10 pt-4">
        <div className="flex justify-center gap-16">
          {tree.map(root => renderNode(root))}
        </div>
      </div>
    </div>
  )
}
