# Custom GLB & AI 3D Models with Scroll World

How to use custom GLB assets or AI-generated 3D models with Three.js, React Three Fiber (R3F), GSAP ScrollTrigger, and the Scroll World engine.

## Table of Contents

- [GLB Asset Structure](#glb-asset-structure)
- [Loading GLB Models in R3F](#loading-glb-models-in-r3f)
- [Scroll-Triggered Animation (GSAP)](#scroll-triggered-animation-gsap)
- [Scroll World Hybrid: Video + 3D](#scroll-world-hybrid-video--3d)
- [AI-Generated 3D Models](#ai-generated-3d-models)
- [Optimization](#optimization)

---

## GLB Asset Structure

Place your GLB files in `public/models/`:

```
public/
  models/
    scene-a.glb
    scene-b.glb
    hero-product.glb
  textures/
    ...
```

---

## Loading GLB Models in R3F

Use `useGLTF` from `@react-three/drei`:

```jsx
import { useGLTF } from '@react-three/drei'

function Model({ url, position, scale, scrollOffset }) {
  const { scene } = useGLTF(url)
  const clone = scene.clone()

  return (
    <primitive
      object={clone}
      position={position}
      scale={scale}
      rotation={[0, 0, 0]}
    />
  )
}
```

### Preload all models at app root:

```jsx
import { useGLTF } from '@react-three/drei'

function Preload() {
  useGLTF.preload('/models/scene-a.glb')
  useGLTF.preload('/models/scene-b.glb')
  return null
}
```

---

## Scroll-Triggered Animation (GSAP)

### 1. Setup GSAP + ScrollTrigger

```bash
npm install gsap
```

### 2. Register ScrollTrigger and drive 3D scene from scroll

```jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useThree } from '@react-three/fiber'

gsap.registerPlugin(ScrollTrigger)

function ScrollDrivenScene() {
  const { camera } = useThree()
  const progress = useRef(0)

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          progress.current = self.progress
        },
      },
    })

    // Animate camera position
    tl.to(camera.position, {
      x: 5,
      y: 3,
      z: -2,
      duration: 1,
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [camera])

  return null
}
```

### 3. Morph or animate GLB models with GSAP

```jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function AnimatedModel() {
  const meshRef = useRef()

  useEffect(() => {
    gsap.to(meshRef.current.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: '#section-2',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })

    gsap.to(meshRef.current.scale, {
      x: 1.5, y: 1.5, z: 1.5,
      scrollTrigger: {
        trigger: '#section-3',
        start: 'top bottom',
        end: 'center center',
        scrub: 0.5,
      },
    })
  }, [])

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b5ce7" />
    </mesh>
  )
}
```

### 4. Full R3F + ScrollTrigger pattern

```jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, ScrollControls, Scroll } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Scene({ scrollProgress }) {
  const modelRef = useRef()
  const { scene } = useGLTF('/models/hero.glb')

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = scrollProgress.current * Math.PI * 2
    }
  })

  return <primitive ref={modelRef} object={scene.clone()} scale={0.5} />
}

export default function App() {
  const progress = useRef({ current: 0 })

  useEffect(() => {
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => { progress.current = self.progress },
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <ScrollControls pages={3}>
        <Scene scrollProgress={progress} />
        <Scroll html>
          <div style={{ height: '300vh' }} />
        </Scroll>
      </ScrollControls>
    </Canvas>
  )
}
```

---

## Scroll World Hybrid: Video + 3D

The Scroll World scrub engine (`references/scrub-engine.js`) normally plays pre-rendered video clips. To mix live 3D scenes into the same scroll chain, use the engine's section-based architecture and swap a video clip for a Three.js canvas for specific sections.

### Hybrid architecture

```
Scroll Position →
  [Video Clip 0] → [Three.js Canvas (live 3D)] → [Video Clip 1] → [...]
```

### Implementation

```js
import { mountScrollWorld } from './scrub-engine'
import { render3DScene } from './three-scene'

const container = document.getElementById('world')

// Use a ref to know which section is active
let activeSection = 0

mountScrollWorld(container, {
  sections: [
    {
      id: 'video-intro',
      label: 'Intro',
      still: 'assets/intro.webp',
      clip: 'assets/intro.mp4',
    },
    // 3D section: clip is null — the HTML overlay hosts the Three.js canvas
    {
      id: 'live-3d',
      label: '3D Experience',
      still: 'assets/3d-poster.webp',
      clip: null,
    },
    {
      id: 'video-outro',
      label: 'Outro',
      still: 'assets/outro.webp',
      clip: 'assets/outro.mp4',
    },
  ],
  connectors: ['assets/conn1.mp4', 'assets/conn2.mp4'],
})

// Listen for section changes and mount/unmount the Three.js scene
const observer = new MutationObserver(() => {
  const activeDot = document.querySelector('.sw-route__dot.is-active')
  if (activeDot) {
    const idx = Array.from(activeDot.parentNode.children).indexOf(activeDot)
    if (idx === 1 && !window.threeMounted) {
      render3DScene(document.getElementById('world'))
      window.threeMounted = true
    }
  }
})
observer.observe(container, { attributes: true, subtree: true, attributeFilter: ['class'] })
```

---

## AI-Generated 3D Models

These tools produce GLB/GLTF assets you can drop directly into your Scroll World:

### 1. Meshy (https://www.meshy.ai)

- Text-to-3D, Image-to-3D
- Exports GLB with PBR materials
- Best for: product shots, characters, organic shapes

```bash
# Meshy API example
curl -X POST https://api.meshy.ai/v1/text-to-3d \
  -H "Authorization: Bearer $MESHY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A low-poly floating island with a crystal tower", "return_type": "glb"}'
```

### 2. Tripo (https://www.tripo3d.ai)

- Fast text/image-to-3D
- Outputs ready-to-render GLB files with clean topology

### 3. Luma AI Genie

- Text/Image-to-3D via web or API
- Good for realistic scans and environment assets

### 4. Rodin (https://rodin.art)

- Generative 3D focused on game-ready assets
- Retopologized, rigged outputs

### Converting AI models for Scroll World

```jsx
import { useGLTF, useAnimations } from '@react-three/drei'

function AIModel({ url }) {
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, scene)

  // AI models often need scaling
  // Use <Stats /> in dev to check performance
  return (
    <group scale={0.01}>
      <primitive object={scene} />
    </group>
  )
}
```

---

## Optimization

| Technique | Why |
|---|---|
| `useGLTF.preload()` | Loads models before the user reaches them |
| `draco` compression | Use Draco-compressed GLB files (smaller, faster) |
| `<Canvas frameloop="demand" />` | Only render when scroll changes — saves battery |
| `bufferGeometry` disposal | Call `geometry.dispose()` when removing models |
| LOD (Level of Detail) | Use `< Detailed>` from drei for distant models |
| InstancedMesh | Same model repeated? Use InstancedMesh (draw one, render many) |

### Draco compression for GLB files

```bash
# Install gltf-transform
npm install -g @gltf-transform/cli

# Compress your GLB
gltf-transform draco input.glb output.glb
```

Then load with Draco decoder:

```jsx
import { useGLTF } from '@react-three/drei'

// Draco decoder is auto-detected by drei when the GLB has Draco attributes
const { scene } = useGLTF('/models/compressed.glb')
```

### Convert everything to `.glb` (single file, no external deps)

```bash
# If you have a glTF folder with .bin + .png:
npx gltf-pipeline -i scene.gltf -o scene.glb
```

---

## Quick Reference

```
Three.js          → 3D rendering engine
React Three Fiber → React wrapper for Three.js (@react-three/fiber)
@react-three/drei → Utility components (ScrollControls, useGLTF, Float, etc.)
GSAP             → Animation library (gsap)
ScrollTrigger    → GSAP plugin for scroll-driven animation
Scroll World     → Pre-rendered video scrub engine (scrub-engine.js)
```

For a working example, see the demo at `src/` in this project, or run `npm run dev` in this directory.
