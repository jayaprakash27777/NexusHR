import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const shader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#6366f1') },
        uColor2: { value: new THREE.Color('#3b82f6') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave1 = sin(pos.x * 2.0 + uTime * 0.5) * 0.08;
          float wave2 = sin(pos.y * 3.0 + uTime * 0.3) * 0.06;
          pos.z += wave1 + wave2;
          vElevation = pos.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uTime;
        void main() {
          float gridX = abs(fract(vUv.x * 20.0 - 0.5) - 0.5) / fwidth(vUv.x * 20.0);
          float gridY = abs(fract(vUv.y * 20.0 - 0.5) - 0.5) / fwidth(vUv.y * 20.0);
          float grid = 1.0 - min(min(gridX, gridY), 1.0);
          vec3 color = mix(uColor1, uColor2, vUv.x + sin(uTime * 0.2) * 0.3);
          float alpha = grid * 0.12 * (1.0 - length(vUv - 0.5) * 1.5);
          alpha += (vElevation + 0.15) * 0.15;
          gl_FragColor = vec4(color, max(alpha, 0.0));
        }
      `,
    }),
    []
  )

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[12, 12, 80, 80]} />
      <shaderMaterial
        {...shader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function AmbientParticles({ count = 200 }) {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
      spd[i] = 0.1 + Math.random() * 0.3
    }
    return { positions: pos, speeds: spd }
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += speeds[i] * 0.003
      if (posArray[i * 3 + 1] > 3) posArray[i * 3 + 1] = -3
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#6366f1"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function AmbientScene() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <GridPlane />
        <AmbientParticles count={150} />
      </Canvas>
    </div>
  )
}
