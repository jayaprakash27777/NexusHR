import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

interface Node {
  id: number
  position: THREE.Vector3
  color: string
  size: number
  label: string
  risk: number
}

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null!)

  const nodes: Node[] = useMemo(() => {
    const depts = [
      { name: 'Engineering', color: '#6366f1', count: 8 },
      { name: 'Design', color: '#8b5cf6', count: 4 },
      { name: 'Sales', color: '#3b82f6', count: 6 },
      { name: 'Finance', color: '#f59e0b', count: 3 },
      { name: 'Marketing', color: '#06b6d4', count: 5 },
      { name: 'HR', color: '#10b981', count: 2 },
    ]

    const result: Node[] = []
    let id = 0
    depts.forEach((dept, di) => {
      const centerAngle = (di / depts.length) * Math.PI * 2
      const centerR = 2.5
      const cx = Math.cos(centerAngle) * centerR
      const cy = Math.sin(centerAngle) * centerR

      // Department hub
      result.push({
        id: id++,
        position: new THREE.Vector3(cx, cy, 0),
        color: dept.color,
        size: 0.2,
        label: dept.name,
        risk: 0,
      })

      // Employee nodes around hub
      for (let i = 0; i < dept.count; i++) {
        const a = (i / dept.count) * Math.PI * 2
        const r = 0.6 + Math.random() * 0.4
        result.push({
          id: id++,
          position: new THREE.Vector3(
            cx + Math.cos(a) * r,
            cy + Math.sin(a) * r,
            (Math.random() - 0.5) * 0.5
          ),
          color: dept.color,
          size: 0.06 + Math.random() * 0.04,
          label: `Emp-${id}`,
          risk: Math.random(),
        })
      }
    })
    return result
  }, [])

  const connections = useMemo(() => {
    const conns: [THREE.Vector3, THREE.Vector3][] = []
    // Connect each employee to its department hub
    let nodeIdx = 0
    const deptCounts = [8, 4, 6, 3, 5, 2]
    deptCounts.forEach((count) => {
      const hubIdx = nodeIdx
      nodeIdx++
      for (let i = 0; i < count; i++) {
        conns.push([nodes[hubIdx].position, nodes[nodeIdx].position])
        nodeIdx++
      }
    })
    return conns
  }, [nodes])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.02
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      {connections.map((conn, i) => (
        <Line
          key={`line-${i}`}
          points={[conn[0].toArray(), conn[1].toArray()]}
          color="#6366f1"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <Float key={node.id} speed={1 + Math.random()} floatIntensity={0.2} rotationIntensity={0.1}>
          <Sphere args={[node.size, 16, 16]} position={node.position}>
            <meshStandardMaterial
              color={node.risk > 0.7 ? '#f43f5e' : node.color}
              emissive={node.risk > 0.7 ? '#f43f5e' : node.color}
              emissiveIntensity={node.risk > 0.7 ? 0.8 : 0.3}
              transparent
              opacity={0.8}
            />
          </Sphere>
          {/* Risk pulse for high-risk nodes */}
          {node.risk > 0.7 && (
            <Sphere args={[node.size * 2, 8, 8]} position={node.position}>
              <meshBasicMaterial color="#f43f5e" transparent opacity={0.1} />
            </Sphere>
          )}
        </Float>
      ))}
    </group>
  )
}

export default function AiNetworkScene() {
  return (
    <div className="w-full h-[400px] rounded-[var(--radius-xl)] overflow-hidden" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#6366f1" />
        <pointLight position={[-5, -5, 3]} intensity={0.3} color="#8b5cf6" />

        <NetworkNodes />
      </Canvas>
    </div>
  )
}
