import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, MeshTransmissionMaterial, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

function Ring({ position, radius, color, speed = 1 }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.1 * speed
    ref.current.rotation.z += delta * 0.05 * speed
  })
  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[radius, 0.04, 16, 64]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  )
}

function FloatingIsland({ scrollTo, position, scale = 1, color = '#6b5ce7', label }) {
  const ref = useRef()
  const scroll = useScroll()
  const startY = position[1]
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.position.y = startY + Math.sin(t * 0.4 + position[0]) * 0.15
    ref.current.rotation.y += 0.002
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.3}>
        <mesh>
          <cylinderGeometry args={[1.2, 1.8, 0.3, 32]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.6, 1.0, 6]} />
          <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(1.3)} roughness={0.3} />
        </mesh>
      </Float>
      <Ring position={[0, -0.2, 0]} radius={1.8} color={color} />
    </group>
  )
}

function Particles({ count = 400 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40
      p[i * 3 + 1] = (Math.random() - 0.5) * 20
      p[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10
    }
    return p
  }, [count])
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.01
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8888ff" transparent opacity={0.5} />
    </points>
  )
}

function ScrollPath() {
  const ref = useRef()
  const scroll = useScroll()
  const { camera } = useThree()
  const points = useMemo(() => {
    const pts = []
    for (let t = 0; t <= 1; t += 0.02) {
      const x = Math.sin(t * Math.PI * 4) * 3
      const y = 2 - t * 4
      const z = 8 - t * 12
      pts.push(new THREE.Vector3(x, y, z))
    }
    return pts
  }, [])
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])

  useFrame(() => {
    const t = scroll.range(0, 1)
    const p = curve.getPoint(t)
    const lookAt = curve.getPoint(Math.min(t + 0.01, 1))
    camera.position.lerp(p, 0.08)
    camera.lookAt(lookAt)
  })

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.02, 8, false]} />
      <meshBasicMaterial color="#b080ff" transparent opacity={0.2} />
    </mesh>
  )
}

function SceneLabel({ children, position }) {
  return (
    <Text position={position} fontSize={0.4} color="#b080ff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
      {children}
    </Text>
  )
}

export function ScrollWorld() {
  const labelY = (idx) => 2 - idx * 1.0
  const scenes = [
    { label: 'Discovery', pos: [-2, 2.0, 4], color: '#6b5ce7' },
    { label: 'Journey', pos: [1, 1.0, 1], color: '#e75c8a' },
    { label: 'Creation', pos: [-1.5, 0.0, -2], color: '#5ce7a0' },
    { label: 'Summit', pos: [2, -1.0, -5], color: '#e7c05c' },
  ]

  return (
    <>
      <Particles />
      <ScrollPath />
      {scenes.map((s, i) => (
        <group key={s.label}>
          <FloatingIsland position={s.pos} color={s.color} label={s.label} />
          <SceneLabel position={[s.pos[0], s.pos[1] + 1.4, s.pos[2]]}>{s.label}</SceneLabel>
        </group>
      ))}
    </>
  )
}
