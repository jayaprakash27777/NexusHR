import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function Minimal3DLoader() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#8b5cf6" wireframe={true} transparent opacity={0.6} />
    </mesh>
  )
}

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated 3D Logo */}
        <motion.div
          className="relative h-24 w-24"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ alpha: true, antialias: true }}>
            <Minimal3DLoader />
          </Canvas>
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-accent-indigo/10 blur-xl -z-10" />
        </motion.div>

        {/* Text */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-lg font-semibold text-foreground tracking-tight">NexusHR</span>
          <span className="text-xs text-muted tracking-wide uppercase">Loading workspace</span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="h-0.5 w-48 overflow-hidden rounded-full bg-surface-hover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-indigo to-accent-violet"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      </div>
    </div>
  )
}
