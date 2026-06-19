import { useEffect, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  format?: 'number' | 'currency'
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  value,
  format = 'number',
  duration = 2000,
  className = ''
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
    duration
  })

  useEffect(() => {
    if (inView) {
      spring.set(value)
    }
  }, [inView, spring, value])

  const display = useTransform(spring, (current) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Math.round(current))
    }
    
    return new Intl.NumberFormat('en-IN').format(Math.round(current))
  })

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
