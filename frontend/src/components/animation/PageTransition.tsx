import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 40,
    rotateX: 10,
    scale: 0.95,
    filter: 'blur(12px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    rotateX: -5,
    scale: 0.98,
    filter: 'blur(8px)',
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
    },
  },
}

const childVariants = {
  initial: { opacity: 0, y: 30, rotateX: 15, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

export { childVariants }

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants as any}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ perspective: 1200 }}
    >
      {children}
    </motion.div>
  )
}
