import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number | string
  previousValue?: number
  format?: 'number' | 'currency' | 'percentage'
  icon: React.ReactNode
  gradient: string
  delay?: number
}

import AnimatedCounter from '@/components/ui/AnimatedCounter'

export default function KPICard({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  gradient,
  delay = 0,
}: KPICardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
  const change = previousValue ? ((numValue - previousValue) / previousValue) * 100 : null
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg'])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    
    // For gradient
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })

    // For 3D tilt
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-xl)]',
        'glass p-6',
        'transition-all duration-500',
        'hover:border-border/60 hover:bg-foreground/5',
        'hover:shadow-2xl hover:shadow-black/60'
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        background: hovered
          ? `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(99,102,241,0.06), transparent 40%)`
          : undefined
      }}
    >
      {/* Gradient accent line */}
      <div className={cn('absolute top-0 left-0 right-0 h-[2px] opacity-60', gradient)} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
            {title}
          </p>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {typeof value === 'number' ? (
              <AnimatedCounter value={numValue} format={format as any} />
            ) : (
              value
            )}
          </div>

          {/* Trend indicator */}
          {change !== null && (
            <div className="mt-3 flex items-center gap-1.5">
              {change > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : change < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-nexus-400" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-muted'
                )}
              >
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted/70">vs last month</span>
            </div>
          )}
        </div>

        {/* Icon container */}
        <motion.div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)]',
            'bg-foreground/5 text-secondary transition-all duration-300',
            'group-hover:scale-110 group-hover:text-foreground'
          )}
          animate={hovered ? { rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Ambient glow on hover */}
      <motion.div
        className={cn(
          'absolute -bottom-8 -right-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500',
          gradient.includes('blue') ? 'bg-accent-blue/10' : 'bg-accent-indigo/10'
        )}
        animate={{ opacity: hovered ? 1 : 0 }}
      />
    </motion.div>
  )
}
