"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Target, Radio, Zap, Users, Workflow, ShoppingBag, TrendingUp, BarChart3, Bell } from "lucide-react"
import Link from "next/link"
import * as THREE from "three"
import { SectionKicker } from "./section-kicker"


// Client-side hook to avoid SSR canvas initialization on mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}

// 3D Flow Builder Card Canvas (Rotating 3D Node Network)
function FlowBuilderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let width = container.clientWidth || 300
    let height = container.clientHeight || 200

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(45, height > 0 ? width / height : 1, 0.1, 100)
    camera.position.z = 8.5

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x25D366, 1.5)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 50)
    pointLight.position.set(-5, -3, -2)
    scene.add(pointLight)

    // Node Network Group
    const networkGroup = new THREE.Group()
    scene.add(networkGroup)

    // Generate Nodes
    const nodeCount = 16
    const nodes: {
      mesh: THREE.Mesh
      initialPos: THREE.Vector3
      speed: number
      phase: number
    }[] = []

    const nodeGeometry = new THREE.SphereGeometry(1, 12, 12)

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 5.5
      const y = (Math.random() - 0.5) * 3.5
      const z = (Math.random() - 0.5) * 3.5
      const pos = new THREE.Vector3(x, y, z)

      const isGreen = Math.random() > 0.4
      const color = isGreen ? 0x25D366 : 0x6366f1
      const size = isGreen ? 0.14 + Math.random() * 0.08 : 0.08 + Math.random() * 0.05

      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        shininess: 80,
      })

      const mesh = new THREE.Mesh(nodeGeometry, material)
      mesh.scale.set(size, size, size)
      mesh.position.copy(pos)
      networkGroup.add(mesh)

      nodes.push({
        mesh,
        initialPos: pos.clone(),
        speed: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // Connect nodes with lines (use a slightly darker/grey tone for visibility on light/dark mode)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.25,
    })

    const connections: [number, number][] = []

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].initialPos.distanceTo(nodes[j].initialPos)
        if (dist < 2.6) {
          connections.push([i, j])
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry()
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
    networkGroup.add(lineMesh)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      networkGroup.rotation.y = elapsedTime * 0.1
      networkGroup.rotation.x = elapsedTime * 0.05
      networkGroup.position.y = Math.sin(elapsedTime * 0.7) * 0.12

      nodes.forEach((node) => {
        const offset = Math.sin(elapsedTime * node.speed + node.phase) * 0.12
        node.mesh.position.x = node.initialPos.x + offset
        node.mesh.position.y = node.initialPos.y + Math.cos(elapsedTime * node.speed + node.phase) * 0.08
        node.mesh.position.z = node.initialPos.z + Math.sin(elapsedTime * 0.4 * node.speed + node.phase) * 0.08

        const pulse = 1.0 + Math.sin(elapsedTime * 2.5 + node.phase) * 0.15
        node.mesh.scale.set(pulse * 0.15, pulse * 0.15, pulse * 0.15)
      })

      const positionsArray: number[] = []
      connections.forEach(([i, j]) => {
        const p1 = nodes[i].mesh.position
        const p2 = nodes[j].mesh.position
        positionsArray.push(p1.x, p1.y, p1.z)
        positionsArray.push(p2.x, p2.y, p2.z)
      })

      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positionsArray, 3))
      lineGeometry.computeBoundingSphere()

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return
        const entry = entries[0]
        width = entry.contentRect.width
        height = entry.contentRect.height || 200

        camera.aspect = height > 0 ? width / height : 1
        camera.updateProjectionMatrix()

        renderer.setSize(width, height)
      })
      resizeObserver.observe(container)

      return () => {
        cancelAnimationFrame(animationFrameId)
        resizeObserver.disconnect()
        scene.remove(networkGroup)
        nodeGeometry.dispose()
        lineGeometry.dispose()
        lineMaterial.dispose()
        nodes.forEach((node) => {
          if (Array.isArray(node.mesh.material)) {
            node.mesh.material.forEach((m) => m.dispose())
          } else {
            node.mesh.material.dispose()
          }
        })
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-[180px] md:h-[220px] rounded-xl overflow-hidden bg-slate-50 dark:bg-neutral-950/60 border border-gray-150 dark:border-white/[0.04]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-100/40 dark:from-black/50 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Live Visual Flow Engine</span>
      </div>
    </div>
  )
}

// 3D WhatsApp Storefront Card Canvas (Rotating 3D Phone Model)
function Storefront3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let width = container.clientWidth || 300
    let height = container.clientHeight || 200

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(45, height > 0 ? width / height : 1, 0.1, 100)
    camera.position.z = 7.5

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 8, 5)
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0x25D366, 3, 20)
    pointLight.position.set(0, 0, 3.5)
    scene.add(pointLight)

    // Phone Model Group
    const phoneGroup = new THREE.Group()
    scene.add(phoneGroup)

    // Phone Body
    const bodyGeom = new THREE.BoxGeometry(2.0, 3.8, 0.16)
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x1f2937,
      shininess: 90,
      specular: 0x4b5563,
    })
    const phoneBody = new THREE.Mesh(bodyGeom, bodyMat)
    phoneGroup.add(phoneBody)

    // Screen
    const screenGeom = new THREE.BoxGeometry(1.85, 3.65, 0.04)
    const screenMat = new THREE.MeshPhongMaterial({
      color: 0x0b111e,
      emissive: 0x111827,
      shininess: 60,
    })
    const phoneScreen = new THREE.Mesh(screenGeom, screenMat)
    phoneScreen.position.z = 0.08
    phoneGroup.add(phoneScreen)

    // WhatsApp Styled Header
    const headerGeom = new THREE.BoxGeometry(1.7, 0.45, 0.02)
    const headerMat = new THREE.MeshBasicMaterial({ color: 0x075e54 })
    const header = new THREE.Mesh(headerGeom, headerMat)
    header.position.set(0, 1.5, 0.11)
    phoneGroup.add(header)

    // Simulated chat bubble 1
    const bubble1Geom = new THREE.BoxGeometry(1.1, 0.35, 0.02)
    const bubble1Mat = new THREE.MeshBasicMaterial({ color: 0x25d366 })
    const bubble1 = new THREE.Mesh(bubble1Geom, bubble1Mat)
    bubble1.position.set(0.25, 0.8, 0.11)
    phoneGroup.add(bubble1)

    // Simulated Product Box
    const prodGeom = new THREE.BoxGeometry(0.8, 0.8, 0.02)
    const prodMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 })
    const prod = new THREE.Mesh(prodGeom, prodMat)
    prod.position.set(-0.35, 0.0, 0.11)
    phoneGroup.add(prod)

    // Simulated checkout button
    const buttonGeom = new THREE.BoxGeometry(0.8, 0.28, 0.02)
    const buttonMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    const button = new THREE.Mesh(buttonGeom, buttonMat)
    button.position.set(0.35, -0.2, 0.11)
    phoneGroup.add(button)

    // Shopping Cart Orbiting Particles
    const particleGroup = new THREE.Group()
    scene.add(particleGroup)

    const particles: {
      mesh: THREE.Mesh
      speed: number
      radiusX: number
      radiusZ: number
      phase: number
      yOffset: number
    }[] = []

    const particleGeom = new THREE.SphereGeometry(0.12, 12, 12)
    const colors = [0x25d366, 0xf59e0b, 0x3b82f6, 0xec4899]

    for (let i = 0; i < 5; i++) {
      const color = colors[i % colors.length]
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
      })
      const mesh = new THREE.Mesh(particleGeom, mat)
      particleGroup.add(mesh)

      particles.push({
        mesh,
        speed: 0.6 + Math.random() * 0.5,
        radiusX: 2.1 + Math.random() * 0.4,
        radiusZ: 1.3 + Math.random() * 0.3,
        phase: (i * Math.PI * 2) / 5,
        yOffset: (Math.random() - 0.5) * 1.6,
      })
    }

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      phoneGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.35
      phoneGroup.rotation.x = 0.15 + Math.cos(elapsedTime * 0.4) * 0.08
      phoneGroup.position.y = Math.sin(elapsedTime * 1.3) * 0.2

      particles.forEach((p) => {
        const angle = elapsedTime * p.speed + p.phase
        p.mesh.position.x = Math.cos(angle) * p.radiusX
        p.mesh.position.z = Math.sin(angle) * p.radiusZ + Math.sin(elapsedTime * 0.8) * 0.1
        p.mesh.position.y = Math.sin(angle * 1.2) * 0.6 + p.yOffset

        const scale = 1.0 + Math.sin(elapsedTime * 3.5 + p.phase) * 0.2
        p.mesh.scale.set(scale, scale, scale)
      })

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return
        const entry = entries[0]
        width = entry.contentRect.width
        height = entry.contentRect.height || 200

        camera.aspect = height > 0 ? width / height : 1
        camera.updateProjectionMatrix()

        renderer.setSize(width, height)
      })
      resizeObserver.observe(container)

      return () => {
        cancelAnimationFrame(animationFrameId)
        resizeObserver.disconnect()
        scene.remove(phoneGroup)
        scene.remove(particleGroup)
        bodyGeom.dispose()
        bodyMat.dispose()
        screenGeom.dispose()
        screenMat.dispose()
        headerGeom.dispose()
        headerMat.dispose()
        bubble1Geom.dispose()
        bubble1Mat.dispose()
        prodGeom.dispose()
        prodMat.dispose()
        buttonGeom.dispose()
        buttonMat.dispose()
        particleGeom.dispose()
        particles.forEach((p) => {
          if (Array.isArray(p.mesh.material)) {
            p.mesh.material.forEach((m) => m.dispose())
          } else {
            p.mesh.material.dispose()
          }
        })
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-[180px] md:h-[220px] rounded-xl overflow-hidden bg-slate-50 dark:bg-neutral-950/60 border border-gray-150 dark:border-white/[0.04]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-100/40 dark:from-black/50 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Storefront 3D Hub</span>
      </div>
    </div>
  )
}

// 3D Tilt Card Wrapper Component (Adaptive theme support: Light mode & Dark mode glassmorphism)
interface BentoCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

function BentoCard({ children, className = "", delay = 0 }: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.05 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const card = cardRef.current
    const glow = glowRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const xc = rect.width / 2
      const yc = rect.height / 2
      
      const rotateX = -((y - yc) / yc) * 8
      const rotateY = ((x - xc) / xc) * 8

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
      
      if (glow) {
        glow.style.opacity = "1"
        glow.style.background = `radial-gradient(320px circle at ${x}px ${y}px, rgba(37, 211, 102, 0.08), transparent 80%)`
      }
    }

    const handleMouseLeave = () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
      card.style.transition = "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)"
      if (glow) {
        glow.style.opacity = "0"
      }
    }

    const handleMouseEnter = () => {
      card.style.transition = "none"
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)
    card.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
      card.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm shadow-slate-100 dark:shadow-2xl transition-all duration-500 hover:border-emerald-500/35 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:shadow-[0_0_40px_rgba(37,211,102,0.06)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 z-0"
      />
      <div className="relative z-10 h-full w-full p-6" style={{ transform: "translateZ(12px)" }}>
        {children}
      </div>
    </div>
  )
}

// Features List Definition
const features = [
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Track every conversation in one clean dashboard — messages, response times, and team activity at a glance.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    isWide: true,
    gridClass: "col-span-1 sm:col-span-2 lg:col-span-2",
    chart: (
      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Total conversations</span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-white">23.02K</span>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Chats", pct: 55, color: "bg-violet-500" },
            { label: "Broadcast", pct: 28, color: "bg-amber-500" },
            { label: "Auto-reply", pct: 17, color: "bg-emerald-500" },
          ].map((item) => (
            <div key={item.label} className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-zinc-800">
                <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
              <p className="mt-1 text-[9px] text-zinc-500 dark:text-zinc-400">{item.label} {item.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    title: "Pipeline Tracking",
    description: "Move deals effortlessly through stages with an intuitive system designed for clarity and control.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    gridClass: "col-span-1",
    chart: (
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { stage: "New", count: "18", color: "text-blue-500 dark:text-blue-400" },
          { stage: "Qualified", count: "7", color: "text-violet-500 dark:text-violet-400" },
          { stage: "Closed", count: "23", color: "text-emerald-500 dark:text-emerald-400" },
        ].map((s) => (
          <div key={s.stage} className="rounded-lg border border-gray-150 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-950/40 p-2 text-center">
            <p className={`text-sm font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500">{s.stage}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Radio,
    title: "Broadcast Studio",
    description: "Send targeted campaigns with delivery tracking and real-time engagement metrics.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    gridClass: "col-span-1",
    chart: (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-550 dark:text-zinc-400">Delivery rate</span>
          <span className="font-medium text-emerald-500 dark:text-emerald-400">95%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-zinc-800">
          <div className="h-1.5 w-[95%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
        </div>
        <div className="flex justify-between text-[9px] text-zinc-450 dark:text-zinc-500">
          <span>Sent: 2,450</span>
          <span>Opened: 1,836</span>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Smart Automations",
    description: "Let smart reminders handle repetitive tasks so you can focus on closing deals.",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    gridClass: "col-span-1",
    chart: (
      <div className="space-y-1.5">
        {[
          { label: "Follow-ups", value: "12", status: "auto" },
          { label: "Triggers active", value: "8", status: "active" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-gray-150 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-950/40 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <Bell className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{item.label}</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-800 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    description: "Get accurate reports and insights that help you understand growth patterns and make confident decisions.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
    gridClass: "col-span-1",
    chart: (
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Revenue", value: "₹48.2K", change: "+12%" },
          { label: "Response", value: "1.8m", change: "-15%" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-150 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-950/40 p-2 text-center">
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400">{item.label}</p>
            <p className="text-xs font-bold text-zinc-800 dark:text-white">{item.value}</p>
            <p className="text-[9px] text-emerald-500">{item.change}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ShoppingBag,
    title: "WhatsApp Storefront",
    description: "Launch a mobile storefront connected to your WhatsApp. Customers browse, cart, and order instantly.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "/shop",
    isWide: true,
    gridClass: "col-span-1 sm:col-span-2 lg:col-span-2",
    canvas3D: "storefront",
    chart: (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-zinc-500 dark:text-zinc-400">Sales today</span>
          <span className="font-semibold text-zinc-800 dark:text-white">₹12,400</span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 28 }}>
          {[40, 55, 35, 70, 50, 85, 65].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-zinc-400 dark:text-zinc-500">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
      </div>
    ),
  },
  {
    icon: Workflow,
    title: "Visual Flow Builder",
    description: "Design customer journeys without code. Drag, connect, and launch multi-step campaigns visually.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    isWide: true,
    gridClass: "col-span-1 sm:col-span-2 lg:col-span-2",
    canvas3D: "flow",
    chart: (
      <div className="flex items-center justify-center gap-1.5 w-full py-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-500">S</div>
        <div className="h-px w-8 bg-gray-200 dark:bg-zinc-800" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-500">Q</div>
        <div className="h-px w-8 bg-gray-200 dark:bg-zinc-800" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-500">C</div>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Rich profiles with custom fields, tags, CSV import, and complete conversation history.",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
    isWide: true,
    gridClass: "col-span-1 sm:col-span-2 lg:col-span-2",
    chart: (
      <div className="flex -space-x-2 justify-center w-full py-2">
        {["PK", "RM", "AG", "SN", "VP"].map((initials, i) => (
          <div
            key={initials}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 text-[9px] font-bold"
            style={{
              background: `linear-gradient(135deg, oklch(0.526 0.247 293 / ${0.5 + i * 0.1}), oklch(0.526 0.247 293 / ${0.2 + i * 0.05}))`,
              color: "white",
            }}
          >
            {initials}
          </div>
        ))}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 bg-primary/20 text-[9px] font-bold text-emerald-500">+2K</div>
      </div>
    ),
  },
]

export function FeaturesSection() {
  const isMobile = useIsMobile()

  return (
    <section id="features" className="border-b border-gray-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-neutral-950 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-emerald-500/[0.03] dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-emerald-500/[0.03] dark:bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Features</SectionKicker>
          <h2 
            className="text-balance text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl tracking-tight"
            style={{ textShadow: "0 0 40px rgba(37, 211, 102, 0.04)" }}
          >
            Powerful Features, Simple to Use
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Everything you need to manage WhatsApp sales, track growth, and stay focused — without the clutter.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const showCanvas3D = feature.canvas3D && !isMobile

            return (
              <BentoCard
                key={feature.title}
                className={feature.gridClass}
                delay={i * 60}
              >
                {feature.isWide ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center h-full">
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {feature.href && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium tracking-wider">Store &rarr;</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                          {feature.href ? (
                            <Link href={feature.href} className="text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200">
                              {feature.title}
                            </Link>
                          ) : (
                            feature.title
                          )}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{feature.description}</p>
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-center z-10">
                      {showCanvas3D ? (
                        feature.canvas3D === "storefront" ? (
                          <Storefront3DCanvas />
                        ) : (
                          <FlowBuilderCanvas />
                        )
                      ) : (
                        <div className="w-full rounded-xl border border-gray-100 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-950/40 p-4">
                          {feature.chart}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {feature.href && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium tracking-wider">Store &rarr;</span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {feature.href ? (
                          <Link href={feature.href} className="text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200">
                            {feature.title}
                          </Link>
                        ) : (
                          feature.title
                        )}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{feature.description}</p>
                    </div>

                    {feature.chart && (
                      <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-950/40 p-3 mt-auto">
                        {feature.chart}
                      </div>
                    )}
                  </div>
                )}
              </BentoCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
