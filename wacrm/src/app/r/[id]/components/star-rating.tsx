'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react'

export interface RatingItem {
  rating: number
  emoji: string
  label: string
  color: string
}

export const EMOJI_RATINGS: RatingItem[] = [
  { rating: 1, emoji: '😡', label: 'Terrible', color: '#EF4444' },
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
  ownerName = 'Mayur',
}: StarRatingProps) {
  const initialIndex = value ? Math.max(0, Math.min(4, value - 1)) : 3

  const [scrollPos, setScrollPos] = useState<number>(initialIndex)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [activeRating, setActiveRating] = useState<number>(initialIndex + 1)
  const [stickerPopKey, setStickerPopKey] = useState<number>(0)

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

  const animateToPos = useCallback((target: number, duration = 300) => {
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

  useEffect(() => {
    if (value !== null && value !== activeRating && !isDragging) {
      const targetIdx = value - 1
      // Sync internal state with the incoming prop, then animate the carousel.
      // Runs once per prop change; React re-renders immediately after.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveRating(value)
      setStickerPopKey((k) => k + 1)
      animateToPos(targetIdx)
    }
  }, [value, activeRating, isDragging])

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
    const stepWidth = 65
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
      setStickerPopKey((k) => k + 1)
    }
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    let target = Math.round(scrollPosRef.current + velocityRef.current * 80)
    target = Math.max(0, Math.min(4, target))

    const newRating = target + 1
    if (newRating !== activeRating) {
      setStickerPopKey((k) => k + 1)
    }
    setActiveRating(newRating)
    animateToPos(target, 280)

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15) } catch {}
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaX || e.deltaY
    const step = delta > 0 ? 1 : -1
    const newIdx = Math.max(0, Math.min(4, Math.round(scrollPosRef.current + step)))
    const newRating = newIdx + 1
    if (newRating !== activeRating) {
      setStickerPopKey((k) => k + 1)
      setActiveRating(newRating)
    }
    animateToPos(newIdx, 260)
  }

  const handleSelectEmoji = (index: number) => {
    if (isDragging) return
    const newRating = index + 1
    if (newRating !== activeRating) {
      setStickerPopKey((k) => k + 1)
      setActiveRating(newRating)
    }
    animateToPos(index, 280)

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(20) } catch {}
    }
  }

  const handleConfirmSelection = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(30) } catch {}
    }
    onChange(activeRating)
  }

  // Calculate arc path coordinates
  const trackWidth = 320
  const getNodeCoords = (index: number) => {
    const t = index / 4
    const x = 32 + t * (trackWidth - 64)
    const y = (1 - t) * (1 - t) * 18 + 2 * (1 - t) * t * 38 + t * t * 18
    return { x, y }
  }

  const pct = Math.max(0, Math.min(1, scrollPos / 4))
  const indX = 32 + pct * (trackWidth - 64)
  const indY = (1 - pct) * (1 - pct) * 18 + 2 * (1 - pct) * pct * 38 + pct * pct * 18

  const activeItem = EMOJI_RATINGS[Math.max(0, Math.min(4, activeRating - 1))]

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 5 EMOJIS ARC SCROLL CAROUSEL */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-full max-w-[340px] h-[140px] flex items-center justify-center cursor-grab active:cursor-grabbing my-2 px-1 overflow-visible touch-none"
      >
        {EMOJI_RATINGS.map((item, index) => {
          const offset = index - scrollPos
          const absOffset = Math.abs(offset)
          const isActive = absOffset < 0.45

          const scale = Math.max(0.70, 1.38 - absOffset * 0.36)
          const opacity = Math.max(0.35, 1.0 - absOffset * 0.28)
          const translateX = offset * 68
          const translateY = Math.pow(offset, 2) * 5.5

          return (
            <div
              key={item.rating}
              onClick={() => handleSelectEmoji(index)}
              className="absolute flex flex-col items-center cursor-pointer transition-all duration-75 ease-out"
              style={{
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                opacity,
                zIndex: Math.round(100 - absOffset * 20),
              }}
            >
              {/* Telegram Sticker Animated Emoji Circle */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <>
                    {/* Glowing outer halo */}
                    <div
                      className="absolute -inset-3.5 rounded-full opacity-70 blur-md pointer-events-none animate-pulse"
                      style={{ background: `radial-gradient(circle, ${item.color}77 0%, transparent 70%)` }}
                    />
                    {/* Telegram Sticker Sparkle Particles */}
                    <span className="absolute -top-3.5 -right-2 text-sm animate-bounce" style={{ animationDuration: '1.6s' }}>✨</span>
                    <span className="absolute -top-2 -left-3 text-xs animate-pulse">🌟</span>
                    <span className="absolute -bottom-2.5 -right-2 text-[10px]">💫</span>
                    <span className="absolute -bottom-2 -left-2 text-[11px] animate-bounce" style={{ animationDuration: '2.2s' }}>🎉</span>
                  </>
                )}

                <div
                  key={isActive ? `sticker-${item.rating}-${stickerPopKey}` : `inactive-${item.rating}`}
                  className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-16 h-16 bg-gradient-to-b from-amber-50 to-white ring-[4px] ring-amber-400 shadow-[0_12px_28px_rgba(245,158,11,0.35)] tg-sticker-bounce tg-sticker-pop'
                      : 'w-11 h-11 bg-white border border-stone-200/90 shadow-2xs hover:border-amber-300'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? 'text-4xl drop-shadow-md' : 'text-xl opacity-90'}`}>
                    {item.emoji}
                  </span>
                </div>
              </div>

              {/* Rating Label */}
              <span
                className={`mt-2 text-center transition-all duration-200 ${
                  isActive
                    ? 'text-xs font-black text-[#D97706] scale-110 drop-shadow-xs'
                    : 'text-[11px] font-medium text-stone-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* CURVED SVG TRACK LINE & NODES */}
      <div className="relative w-full max-w-[340px] h-10 flex items-center justify-center -mt-2">
        <svg viewBox="0 0 320 50" className="w-full h-full overflow-visible">
          {/* Subtle curved track line */}
          <path
            d="M 32 18 Q 160 38 288 18"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2"
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
                  stroke={isDotActive ? '#F59E0B' : '#CBD5E1'}
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

      {/* RATING SELECTION CONFIRMATION BUTTON */}
      <button
        type="button"
        onClick={handleConfirmSelection}
        className="w-full max-w-[340px] mt-3 mb-2 py-3.5 px-6 rounded-2xl font-black text-white text-base shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.96] flex items-center justify-center gap-2.5 cursor-pointer tracking-wide group"
        style={{
          background: `linear-gradient(135deg, ${activeItem.color}, ${activeItem.color}E6)`,
          boxShadow: `0 10px 25px -4px ${activeItem.color}66`,
        }}
      >
        <span>Select &ldquo;{activeItem.label}&rdquo;</span>
        <span className="text-2xl transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12">
          {activeItem.emoji}
        </span>
        <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1" />
      </button>

      {/* SECURITY / TRUST CONFIRMATION BADGE */}
      <div className="w-full max-w-[340px] mt-3 mb-4 rounded-2xl bg-white border border-stone-100 p-4 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <ShieldCheck className="h-5.5 w-5.5" />
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

      {/* TELEGRAM STICKER ANIMATION STYLES */}
      <style jsx global>{`
        .tg-sticker-pop {
          animation: tgStickerPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .tg-sticker-bounce {
          animation: tgStickerWobble 2.4s ease-in-out infinite alternate;
        }
        @keyframes tgStickerPop {
          0% { transform: scale(0.65) rotate(-12deg); opacity: 0.6; }
          60% { transform: scale(1.22) rotate(6deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-3deg); }
          100% { transform: scale(1.1) rotate(0deg); opacity: 1; }
        }
        @keyframes tgStickerWobble {
          0% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-4px) rotate(-3deg); }
          60% { transform: translateY(-1px) rotate(3deg); }
          100% { transform: translateY(-3px) rotate(-1deg); }
        }
      `}</style>
    </div>
  )
}
