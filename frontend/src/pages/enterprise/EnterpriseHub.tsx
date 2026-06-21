import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Settings, Building2, Shield, Settings2, FileText, Workflow,
  GitMerge, UserSquare, Rocket, Map, BookOpen, GraduationCap,
  BrainCircuit, GitBranch, PieChart, Crown, Milestone
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'

const categories = [
  {
    title: 'Platform Settings',
    items: [
      { name: 'Feature Flags', path: '/features', icon: Settings, desc: 'Manage beta features' },
      { name: 'Tenant Config', path: '/settings/tenant', icon: Building2, desc: 'Organization details' },
      { name: 'Permissions', path: '/settings/permissions', icon: Shield, desc: 'Role-based access' },
      { name: 'Audit Logs', path: '/settings/audit-logs', icon: Shield, desc: 'System activity logs' },
      { name: 'Platform Config', path: '/settings/platform', icon: Settings2, desc: 'Global settings' },
    ]
  },
  {
    title: 'Automation Engine',
    items: [
      { name: 'Form Builder', path: '/automation/forms', icon: FileText, desc: 'Custom data forms' },
      { name: 'Workflows', path: '/automation/workflows', icon: Workflow, desc: 'Business processes' },
      { name: 'Approvals', path: '/automation/approvals', icon: GitMerge, desc: 'Approval chains' },
      { name: 'Delegation', path: '/automation/delegation', icon: UserSquare, desc: 'Task delegation' },
    ]
  },
  {
    title: 'Knowledge Base',
    items: [
      { name: 'Release Notes', path: '/knowledge/releases', icon: Rocket, desc: 'Product updates' },
      { name: 'Product Tours', path: '/knowledge/onboarding', icon: Map, desc: 'User onboarding' },
      { name: 'Wiki', path: '/knowledge/wiki', icon: BookOpen, desc: 'Company handbook' },
      { name: 'Learning', path: '/knowledge/learning', icon: GraduationCap, desc: 'Training courses' },
    ]
  },
  {
    title: 'Workforce Planning',
    items: [
      { name: 'Forecast', path: '/planning/forecast', icon: BrainCircuit, desc: 'AI predictions' },
      { name: 'Scenarios', path: '/planning/scenarios', icon: GitBranch, desc: 'What-if analysis' },
      { name: 'Compensation', path: '/planning/compensation', icon: PieChart, desc: 'Salary planning' },
      { name: 'Succession', path: '/planning/succession', icon: Crown, desc: 'Leadership pipeline' },
      { name: 'Career Pathing', path: '/planning/careers', icon: Milestone, desc: 'Employee growth' },
    ]
  }
]

export default function EnterpriseHub() {
  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Enterprise Hub</h1>
        <p className="text-sm text-nexus-400 mt-1">Centralized command center for all enterprise configuration.</p>
      </div>

      <div className="space-y-8">
        {categories.map((category, i) => (
          <div key={category.title}>
            <h2 className="text-lg font-semibold text-nexus-200 mb-4">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.items.map((item, j) => {
                const Icon = item.icon
                return (
                  <Link key={item.path} to={item.path}>
                    <GlassCard hover className="p-4 h-full" delay={i * 0.1 + j * 0.05} glow="indigo">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-accent-indigo/10 text-accent-indigo">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">{item.name}</h3>
                          <p className="text-xs text-nexus-400 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  )
}
