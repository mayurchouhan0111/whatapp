'use client'

import { useMemo } from 'react'

function mulberry32(a: number) {
  return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}

export function ParticleField({ color = '#a78bfa', count = 20 }: { color?: string; count?: number }) {
  const particles = useMemo(() => {
    const rng = mulberry32(42)
    const p: { left: number; top: number; size: number; delay: number; duration: number; opacity: number }[] = []
    for (let i = 0; i < count; i++) {
      p.push({
        left: rng() * 100,
        top: rng() * 100,
        size: 2 + rng() * 5,
        delay: rng() * 8,
        duration: 6 + rng() * 8,
        opacity: 0.15 + rng() * 0.3,
      })
    }
    return p
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="p-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: color,
            borderRadius: '50%',
            position: 'absolute',
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
          }}
        />
      ))}
      <style jsx global>{`
        .p-particle {
          animation: p-drift var(--duration, 8s) ease-in-out var(--delay, 0s) infinite alternate;
        }
        @keyframes p-drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          100% { transform: translate(15px, -20px) scale(1.3); opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .p-particle { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
