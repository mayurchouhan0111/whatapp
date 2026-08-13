'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, ShieldCheck, Lock } from 'lucide-react'

export interface RatingItem {
  rating: number
  emoji: string
  label: string
  color: string
}

export const EMOJI_RATINGS: RatingItem[] = [
  { rating: 1, emoji: '😠', label: 'Terrible', color: '#EF4444' },
  { rating: 2, emoji: '😞', label: 'Poor', color: '#F97316' },
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
  // Initial center position index (default to 3 = rating 4 "Great", matching reference image)
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
  const carouselRef = useRef<HTMLDivElement>(null)

  // Keep ref synchronized with state
  useEffect(() => {
    scrollPosRef.current = scrollPos
  }, [scrollPos])

  // Synchronize when value changes externally
  useEffect(() => {
    if (value !== null && value !== activeRating && !isDragging) {
      const targetIdx = value - 1
      setActiveRating(value)
      animateToPos(targetIdx)
    }
  }, [value, activeRating, isDragging])

  // Smooth spring / cubic animation to target index
  const animateToPos = useCallback((target: number, duration = 320) => {
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

  // Gesture handling: Pointer / Touch events
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
    // Responsive step distance (~68px per item)
    const stepWidth = 68
    const rawPos = dragStartRef.current.scrollStart - deltaX / stepWidth

    // Rubberband elastic bounds at edges (-0.3 to 4.3)
    let clampedPos = rawPos
    if (rawPos < 0) {
      clampedPos = rawPos * 0.25
    } else if (rawPos > 4) {
      clampedPos = 4 + (rawPos - 4) * 0.25
    }

    const now = performance.now()
    const dt = now - dragStartRef.current.time
    if (dt > 0) {
      velocityRef.current = (scrollPosRef.current - clampedPos) / dt
    }

    dragStartRef.current.time = now
    setScrollPos(clampedPos)
    scrollPosRef.current = clampedPos

    // Update active rating in real time as drag occurs
    const nearest = Math.max(1, Math.min(5, Math.round(clampedPos) + 1))
    if (nearest !== activeRating) {
      setActiveRating(nearest)
    }
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    // Momentum snapping calculation
    let target = Math.round(scrollPosRef.current + velocityRef.current * 100)
    target = Math.max(0, Math.min(4, target))

    setActiveRating(target + 1)
    animateToPos(target, 280)

    // Optional haptic vibration
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch {}
    }
  }

  // Handle direct tap selection on an emoji
  const handleSelectEmoji = (index: number) => {
    if (isDragging) return
    const newRating = index + 1
    if (activeRating === newRating) {
      // Tapping the centered active emoji confirms selection
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(25) } catch {}
      }
      onChange(newRating)
      return
    }
    setActiveRating(newRating)
    animateToPos(index, 300)

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20)
      } catch {}
    }
  }

  // Calculate track indicator SVG coordinates along curved path
  const trackWidth = 320
  const indPct = Math.max(0, Math.min(1, scrollPos / 4))
  const indX = 35 + indPct * (trackWidth - 70)
  const indY = 24 + Math.pow((indPct - 0.5) * 2, 2) * 16

  const activeItem = EMOJI_RATINGS[Math.max(0, Math.min(4, activeRating - 1))]

  return (
    <div className="w-full flex flex-col items-center select-none touch-pan-y">
      {/* 5. INTERACTIVE EMOJI CAROUSEL AREA */}
      <div
        ref={carouselRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full max-w-[360px] h-[190px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible my-1"
      >
        {/* Soft glowing radial backdrop under active emoji */}
        <div
          className="absolute w-40 h-40 rounded-full opacity-35 blur-2xl transition-all duration-300 pointer-events-none"
          style={{
            left: `calc(50% + ${(scrollPos - 2) * -16}px - 80px)`,
            top: '15px',
            background: `radial-gradient(circle, ${activeItem.color} 0%, transparent 70%)`,
          }}
        />

        {/* Emojis Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {EMOJI_RATINGS.map((item, index) => {
            // Distance from current scroll position
            const offset = index - scrollPos
            const absOffset = Math.abs(offset)

            // Dynamic continuous scaling & opacity
            const scale = Math.max(0.68, 1.42 - absOffset * 0.36)
            const opacity = Math.max(0.35, 1.0 - absOffset * 0.28)

            // 3D Arc vertical curve (center is elevated)
            const yArc = Math.pow(offset, 2) * 8
            const yElevation = absOffset < 0.5 ? -14 * (1 - absOffset * 2) : 0
            const translateY = yArc + yElevation

            // Horizontal displacement
            const translateX = offset * 68

            const isActive = absOffset < 0.4

            return (
              <div
                key={item.rating}
                onClick={() => handleSelectEmoji(index)}
                className="absolute flex flex-col items-center transition-transform duration-75 ease-out cursor-pointer"
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                  opacity,
                  zIndex: Math.round(100 - absOffset * 20),
                }}
              >
                {/* Active Glowing Ring & Particle Container */}
                <div className="relative flex items-center justify-center">
                  {isActive && (
                    <>
                      {/* Outer pulsing ring */}
                      <div
                        className="absolute -inset-3.5 rounded-full opacity-40 animate-ping pointer-events-none"
                        style={{ border: `2.5px solid ${item.color}` }}
                      />
                      {/* Soft ambient blur ring */}
                      <div
                        className="absolute -inset-4 rounded-full opacity-60 blur-md pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${item.color}45 0%, transparent 70%)` }}
                      />
                      {/* Floating sparkle accents */}
                      <span className="absolute -top-3 -right-2 text-xs animate-bounce" style={{ animationDuration: '1.8s' }}>
                        ✨
                      </span>
                      <span className="absolute -bottom-2 -left-2 text-[10px] animate-pulse">🌟</span>
                    </>
                  )}

                  {/* Emoji Circle Button */}
                  <div
                    className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-20 h-20 shadow-[0_12px_28px_rgba(245,158,11,0.35)] ring-[3.5px] ring-amber-400 bg-gradient-to-b from-amber-50 to-amber-100/90'
                        : 'w-14 h-14 bg-white/90 shadow-md border border-stone-200/80 hover:bg-white hover:border-amber-200'
                    }`}
                  >
                    <span
                      className={`transition-transform duration-200 ${
                        isActive ? 'text-4xl scale-110 drop-shadow-md' : 'text-2xl opacity-90'
                      }`}
                    >
                      {item.emoji}
                    </span>
                  </div>
                </div>

                {/* Animated Rating Label */}
                <span
                  className={`mt-2.5 text-xs tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'text-amber-600 font-extrabold text-sm scale-110 drop-shadow-xs'
                      : 'text-stone-500 font-semibold opacity-85'
                  }`}
                  style={{
                    color: isActive ? '#D97706' : '#78716C',
                  }}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 11. CURVED RATING TRACK SVG */}
      <div className="relative w-full max-w-[340px] h-12 flex items-center justify-center mt-1">
        <svg viewBox="0 0 320 50" className="w-full h-full overflow-visible">
          {/* Subtle curved track line matching arc */}
          <path
            d="M 35 24 Q 160 40 285 24"
            fill="none"
            stroke="#E7E5E4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 35 24 Q 160 40 285 24"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            className="opacity-70"
          />

          {/* 5 Rating Position Dots */}
          {[0, 1, 2, 3, 4].map((i) => {
            const pct = i / 4
            const px = 35 + pct * (trackWidth - 70)
            const py = 24 + Math.pow((pct - 0.5) * 2, 2) * 16
            const isDotActive = Math.abs(i - scrollPos) < 0.4

            return (
              <g key={i} onClick={() => handleSelectEmoji(i)} className="cursor-pointer">
                <circle
                  cx={px}
                  cy={py}
                  r={isDotActive ? '6' : '4'}
                  fill={isDotActive ? '#F59E0B' : '#FFFFFF'}
                  stroke={isDotActive ? '#F59E0B' : '#D6D3D1'}
                  strokeWidth={isDotActive ? '2' : '1.5'}
                  className="transition-all duration-200"
                />
              </g>
            )
          })}

          {/* Animated Active Indicator Dot gliding smoothly along track */}
          <circle
            cx={indX}
            cy={indY}
            r="7"
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            className="drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)] transition-all duration-75"
          />
        </svg>
      </div>

      {/* 12. EXPLICIT RATING SELECTION BUTTON */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(25)
            } catch {}
          }
          onChange(activeRating)
        }}
        className="w-full max-w-[340px] mt-4 py-3.5 px-6 rounded-2xl font-black text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2.5 text-base cursor-pointer tracking-wide group"
        style={{
          background: `linear-gradient(135deg, ${activeItem.color}, ${activeItem.color}E6)`,
          boxShadow: `0 10px 28px -4px ${activeItem.color}66`,
        }}
      >
        <span>Select &ldquo;{activeItem.label}&rdquo;</span>
        <span className="text-xl transition-transform duration-200 group-hover:scale-125">{activeItem.emoji}</span>
      </button>

      {/* 16. SECURITY CONFIRMATION BOX */}
      <div className="w-full max-w-[340px] mt-6 mb-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] p-4 flex items-center justify-center gap-3 shadow-xs transition-all duration-300">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="text-xs text-stone-600 leading-snug font-medium text-left">
          Your feedback is securely logged and{' '}
          <span className="font-bold text-emerald-600">highly valued</span>
        </p>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-1.5 pt-2 pb-1 text-[11px] text-stone-400 font-medium">
        <Lock className="h-3.5 w-3.5 text-amber-500/80" />
        <span>
          Powered by <strong className="font-bold text-amber-600">{ownerName || 'Mayur'}</strong> Experience Platform
        </span>
      </div>
    </div>
  )
}



