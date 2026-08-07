import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { ScrollWorld } from './ScrollWorld'
import { Overlay } from './Overlay'
import { useRef } from 'react'

export default function App() {
  const containerRef = useRef()
  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#0a0a1a']} />
        <fog attach="fog" args={['#0a0a1a', 15, 30]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-5, 0, 5]} intensity={0.5} color="#b080ff" />
        <ScrollControls pages={4} damping={0.3}>
          <ScrollWorld />
          <Scroll html>
            <Overlay />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  )
}
