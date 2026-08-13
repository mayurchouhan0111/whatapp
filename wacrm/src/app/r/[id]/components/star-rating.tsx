'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ShieldCheck, Lock } from 'lucide-react'

export interface RatingItem {
  rating: number
  emoji: string
  label: string
  color: string
}

export const EMOJI_RATINGS: RatingItem[] = [
  { rating: 1, emoji: '😡', label: 'Terrible', color: '#EF4444' },
  { rating: 2, emoji: '🙁', label: 'Poor', color: '#F97316' },
  { rating: 3, emoji: '😊', label: 'Good', color: '#EAB308' },
  { rating: 4, emoji: '😍', label: 'Great', color: '#F59E0B' },
  { rating: 5, emoji: '🤩', label: 'Amazing', color: '#8B5CF6' },
]

interface StarRatingProps {
  value: number | null
  onChange: (rating: number) => void
  color?: string
  contactName?: string
  ownerName?: string
  businessName?: string
}

export function StarRating({
  value,
  onChange,
  color = '#F59E0B',
  contactName = 'Mayur Chouhan',
  ownerName = 'Mayur',
  businessName = 'Mayur Experience Platform',
}: StarRatingProps) {
  // Default initial active index to 3 (Rating 4: "Great", matching reference image)
  const initialIndex = value ? Math.max(0, Math.min(4, value - 1)) : 3

  const [scrollPos, setScrollPos] = useState<number>(initialIndex)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [activeRating, setActiveRating] = useState<number>(initialIndex + 1)

  const scrollPosRef = useRef<number>(initialIndex)
  const dragStartRef = useRef<{ x: number; scrollStart: number; time: number }>({
    x: 0,
    scrollStart: initialIndex,
    time: 0,
  })
  const velocityRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollPosRef.current = scrollPos
  }, [scrollPos])

  useEffect(() => {
    if (value !== null && value !== activeRating && !isDragging) {
      const targetIdx = value - 1
      setActiveRating(value)
      animateToPos(targetIdx)
    }
  }, [value, activeRating, isDragging])

  const animateToPos = useCallback((target: number, duration = 280) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const start = scrollPosRef.current
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = start + (target - start) * ease

      setScrollPos(current)
      scrollPosRef.current = current

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        setScrollPos(target)
        scrollPosRef.current = target
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      scrollStart: scrollPosRef.current,
      time: performance.now(),
    }
    velocityRef.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartRef.current.x
    const stepWidth = 60
    const rawPos = dragStartRef.current.scrollStart - deltaX / stepWidth

    let clampedPos = rawPos
    if (rawPos < 0) {
      clampedPos = rawPos * 0.2
    } else if (rawPos > 4) {
      clampedPos = 4 + (rawPos - 4) * 0.2
    }

    const now = performance.now()
    const dt = now - dragStartRef.current.time
    if (dt > 0) {
      velocityRef.current = (scrollPosRef.current - clampedPos) / dt
    }

    dragStartRef.current.time = now
    setScrollPos(clampedPos)
    scrollPosRef.current = clampedPos

    const nearest = Math.max(1, Math.min(5, Math.round(clampedPos) + 1))
    if (nearest !== activeRating) {
      setActiveRating(nearest)
    }
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    let target = Math.round(scrollPosRef.current + velocityRef.current * 80)
    target = Math.max(0, Math.min(4, target))

    const newRating = target + 1
    setActiveRating(newRating)
    animateToPos(target, 250)

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15) } catch {}
    }

    setTimeout(() => {
      onChange(newRating)
    }, 220)
  }

  const handleSelectEmoji = (index: number) => {
    if (isDragging) return
    const newRating = index + 1
    setActiveRating(newRating)
    animateToPos(index, 260)

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(20) } catch {}
    }

    setTimeout(() => {
      onChange(newRating)
    }, 220)
  }

  // Calculate coordinates along arc path for 5 items
  // Path starts at (32, 20), sags down to (160, 44) in center, ends at (288, 20)
  const trackWidth = 320
  const getNodeCoords = (index: number) => {
    const t = index / 4
    const x = 32 + t * (trackWidth - 64)
    // Quadratic bezier y equation for P0(32, 20), P1(160, 44), P2(288, 20)
    const y = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 44 + t * t * 20
    return { x, y }
  }

  // Active indicator coordinates along continuous curve
  const pct = Math.max(0, Math.min(1, scrollPos / 4))
  const indX = 32 + pct * (trackWidth - 64)
  const indY = (1 - pct) * (1 - pct) * 20 + 2 * (1 - pct) * pct * 44 + pct * pct * 20

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 5 EMOJIS ARC CONTAINER */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full max-w-[340px] h-[125px] flex items-center justify-between cursor-grab active:cursor-grabbing my-1 px-1 overflow-visible"
      >
        {EMOJI_RATINGS.map((item, index) => {
          const coords = getNodeCoords(index)
          const absOffset = Math.abs(index - scrollPos)
          const isActive = absOffset < 0.45

          return (
            <div
              key={item.rating}
              onClick={() => handleSelectEmoji(index)}
              className="absolute flex flex-col items-center cursor-pointer transition-all duration-200"
              style={{
                left: `${coords.x}px`,
                top: `${coords.y - 42}px`,
                transform: 'translateX(-50%)',
                zIndex: isActive ? 30 : 10,
              }}
            >
              {/* Emoji Circle Button */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <>
                    {/* Glowing outer halo */}
                    <div
                      className="absolute -inset-3 rounded-full opacity-60 blur-md pointer-events-none animate-pulse"
                      style={{ background: `radial-gradient(circle, ${item.color}66 0%, transparent 70%)` }}
                    />
                    {/* Sparkle accent */}
                    <span className="absolute -top-2.5 -right-2 text-xs">✨</span>
                  </>
                )}

                <div
                  className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-14 h-14 bg-gradient-to-b from-amber-50 to-amber-100/90 ring-[3.5px] ring-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.35)] scale-110'
                      : 'w-11 h-11 bg-white border border-stone-200/90 shadow-2xs hover:border-amber-300 hover:scale-105'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? 'text-3xl' : 'text-xl'}`}>
                    {item.emoji}
                  </span>
                </div>
              </div>

              {/* Rating Label */}
              <span
                className={`mt-1.5 text-center transition-all duration-200 ${
                  isActive
                    ? 'text-xs font-black text-[#D97706] scale-105'
                    : 'text-[11px] font-semibold text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* CURVED SVG TRACK LINE & NODES */}
      <div className="relative w-full max-w-[340px] h-10 flex items-center justify-center -mt-3">
        <svg viewBox="0 0 320 50" className="w-full h-full overflow-visible">
          {/* Subtle curved track line */}
          <path
            d="M 32 20 Q 160 44 288 20"
            fill="none"
            stroke="#E7E5E4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 5 Position Nodes */}
          {[0, 1, 2, 3, 4].map((i) => {
            const coords = getNodeCoords(i)
            const isDotActive = Math.abs(i - scrollPos) < 0.45

            return (
              <g key={i} onClick={() => handleSelectEmoji(i)} className="cursor-pointer">
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isDotActive ? '6' : '4'}
                  fill={isDotActive ? '#F59E0B' : '#FFFFFF'}
                  stroke={isDotActive ? '#F59E0B' : '#D6D3D1'}
                  strokeWidth={isDotActive ? '2' : '1.5'}
                  className="transition-all duration-200"
                />
              </g>
            )
          })}

          {/* Active Glide Dot */}
          <circle
            cx={indX}
            cy={indY}
            r="6.5"
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth="2"
            className="drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)] transition-all duration-75"
          />
        </svg>
      </div>

      {/* SECURITY / TRUST CONFIRMATION BADGE */}
      <div className="w-full max-w-[340px] mt-5 mb-4 rounded-2xl bg-[#F4FBF7] border border-[#DCFCE7] p-4 flex items-center gap-3.5 shadow-2xs">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-600 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="text-xs text-stone-600 leading-relaxed font-medium text-left">
          Your feedback is securely logged and{' '}
          <span className="font-bold text-emerald-600">highly valued</span>
        </p>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-1.5 pt-1 pb-1 text-[11px] text-stone-400 font-medium">
        <Lock className="h-3.5 w-3.5 text-amber-500" />
        <span>
          Powered by <strong className="font-bold text-amber-600">{ownerName || 'Mayur'}</strong> Experience Platform
        </span>
      </div>
    </div>
  )
}
