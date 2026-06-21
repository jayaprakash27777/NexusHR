import { Suspense, lazy } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import AiCopilot from '@/components/ai/AiCopilot'
import ChatSidebar from '@/components/realtime/ChatSidebar'
import NoiseFilter from '@/components/ui/NoiseFilter'

const AmbientScene = lazy(() => import('@/components/3d/AmbientScene'))

export default function DashboardLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-nexus-950">
      <NoiseFilter />
      <Sidebar />

      {/* Global AI & Realtime overlays */}
      <AiCopilot />
      <ChatSidebar />

      {/* Ambient 3D background */}
      <Suspense fallback={null}>
        <AmbientScene />
      </Suspense>

      <motion.main
        className="flex-1 overflow-hidden flex flex-col"
        animate={{ marginLeft: sidebarCollapsed ? 96 : 284 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Topbar />
        
        <div className="flex-1 w-full p-4 overflow-hidden">
          <div className="relative h-full w-full rounded-[var(--radius-2xl)] border border-white/[0.05] bg-nexus-900 shadow-2xl overflow-y-auto">
            {/* Ambient gradient overlays inside the main view */}
            <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden rounded-[var(--radius-2xl)]">
              <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent-indigo/[0.02] blur-[120px]" />
              <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-accent-violet/[0.01] blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent-blue/[0.01] blur-[100px]" />
            </div>

            <div className="relative z-10 p-6 lg:p-8 min-h-full">
              <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  )
}
