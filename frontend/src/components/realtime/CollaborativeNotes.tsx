import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlignLeft, Bold, Italic, Type, Users, Save, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store'

interface Cursor {
  id: string
  name: string
  color: string
  x: number
  y: number
  opacity: number
}

export default function CollaborativeNotes() {
  const user = useAuthStore(s => s.user)
  const [content, setContent] = useState('# Q2 Workforce Planning\n\n- Engineering requires 5 new senior hires.\n- Marketing attrition is stable.\n- Review payroll forecast.')
  const [saved, setSaved] = useState(true)
  const [cursors, setCursors] = useState<Cursor[]>([
    { id: '1', name: 'Sarah Chen', color: '#8b5cf6', x: 200, y: 150, opacity: 1 },
    { id: '2', name: 'Raj Patel', color: '#06b6d4', x: 400, y: 200, opacity: 0 }
  ])
  const containerRef = useRef<HTMLDivElement>(null)

  // Simulate remote cursors moving
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => prev.map(c => {
        if (Math.random() > 0.6) {
          // Move randomly
          return {
            ...c,
            x: Math.max(20, Math.min(800, c.x + (Math.random() - 0.5) * 150)),
            y: Math.max(50, Math.min(300, c.y + (Math.random() - 0.5) * 100)),
            opacity: 1
          }
        }
        // Fade out slightly if not moving
        return { ...c, opacity: Math.max(0, c.opacity - 0.1) }
      }))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setSaved(false)
    setTimeout(() => setSaved(true), 1000)
  }

  return (
    <div ref={containerRef} className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-nexus-900/40 backdrop-blur-xl">
      {/* Remote Cursors Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <AnimatePresence>
          {cursors.map(c => c.opacity > 0 && (
            <motion.div
              key={c.id}
              initial={{ x: c.x, y: c.y, opacity: 0 }}
              animate={{ x: c.x, y: c.y, opacity: c.opacity }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute flex items-center gap-2"
              style={{ top: 0, left: 0 }}
            >
              <div 
                className="h-4 w-1 -skew-x-12" 
                style={{ backgroundColor: c.color }} 
              />
              <div 
                className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg"
                style={{ backgroundColor: c.color }}
              >
                {c.name}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-1">
          <button className="rounded p-1.5 text-nexus-400 hover:bg-white/10 hover:text-nexus-100"><Type className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-nexus-400 hover:bg-white/10 hover:text-nexus-100"><Bold className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-nexus-400 hover:bg-white/10 hover:text-nexus-100"><Italic className="h-4 w-4" /></button>
          <div className="mx-2 h-4 w-[1px] bg-white/10" />
          <button className="rounded p-1.5 text-nexus-400 hover:bg-white/10 hover:text-nexus-100"><AlignLeft className="h-4 w-4" /></button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-nexus-900 bg-accent-violet text-[9px] font-bold text-white">SC</div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-nexus-900 bg-accent-cyan text-[9px] font-bold text-white">RP</div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-nexus-900 bg-white/10 text-[9px] text-nexus-400"><Users className="h-3 w-3" /></div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-nexus-500">
            {saved ? <CheckCircle className="h-3 w-3 text-success" /> : <Save className="h-3 w-3 text-warning" />}
            {saved ? 'Saved' : 'Saving...'}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-6">
        <textarea
          value={content}
          onChange={handleChange}
          className="h-full w-full resize-none bg-transparent text-sm text-nexus-100 outline-none leading-relaxed placeholder-nexus-600 custom-scrollbar"
          placeholder="Start typing..."
        />
      </div>
    </div>
  )
}
