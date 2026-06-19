import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'blue' | 'indigo' | 'violet' | 'none'
  delay?: number
  onClick?: (e: React.MouseEvent) => void
}

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = 'none',
  delay = 0,
  onClick,
}: GlassCardProps) {
  const glowClass = {
    blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]',
    indigo: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]',
    violet: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]',
    none: '',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      whileHover={hover ? { 
        y: -5, 
        scale: 1.02, 
        rotateX: -2,
        rotateY: 2,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
      } : undefined}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
      className={cn(
        'glass overflow-hidden transition-all duration-300',
        hover && 'cursor-pointer',
        glowClass[glow],
        className
      )}
    >
      <div style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  )
}
