'use client'

import { useState } from 'react'
import { Sparkles, HeartHandshake, Smile, ThumbsUp, Flame } from 'lucide-react'

const EMOJI_MAP: Record<
  number,
  { emoji: string; label: string; color: string; bg: string; icon: React.ElementType }
> = {
  1: { emoji: '😡', label: 'Terrible', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: Flame },
  2: { emoji: '😕', label: 'Poor', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', icon: ThumbsUp },
  3: { emoji: '😊', label: 'Good', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', icon: Smile },
  4: { emoji: '😍', label: 'Great', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: HeartHandshake },
  5: { emoji: '🤩', label: 'Amazing', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.18)', icon: Sparkles },
}

export function StarRating({
  value,
  onChange,
  color,
}: {
  value: number | null
  onChange: (rating: number) => void
  color: string
}) {
  const [hover, setHover] = useState<number | null>(null)

  const activeStar = hover !== null ? hover : value
  const activeItem = activeStar ? EMOJI_MAP[activeStar] : null

  return (
    <div className="flex flex-col items-center space-y-4 py-2">
      {/* Top dynamic status banner */}
      <div className="h-7 flex items-center justify-center">
        {activeItem ? (
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-300 animate-scale-in"
            style={{
              backgroundColor: `${activeItem.color}20`,
              color: activeItem.color,
              border: `1px solid ${activeItem.color}40`,
            }}
          >
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            <span>{activeItem.label} ({activeStar} / 5)</span>
          </div>
        ) : (
          <p className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            Tap an emoji to rate your experience
          </p>
        )}
      </div>

      {/* Emoji rating buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3.5 select-none">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = hover !== null ? hover === star : value === star
          const isPastActive = value !== null && star <= value
          const item = EMOJI_MAP[star]
          const IconComp = item.icon

          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              className={`group relative flex flex-col items-center justify-center rounded-2xl p-2.5 sm:p-3.5 transition-all duration-300 outline-none ${
                active
                  ? 'scale-125 -translate-y-3 z-10 shadow-2xl'
                  : isPastActive
                  ? 'scale-105 -translate-y-1'
                  : 'hover:scale-110 hover:-translate-y-1 opacity-80 hover:opacity-100'
              }`}
              style={{
                background: active
                  ? `linear-gradient(135deg, ${item.bg}, rgba(255,255,255,0.08))`
                  : isPastActive
                  ? `${item.color}15`
                  : 'rgba(255, 255, 255, 0.04)',
                border: `2px solid ${
                  active ? item.color : isPastActive ? `${item.color}50` : 'rgba(255, 255, 255, 0.12)'
                }`,
                boxShadow: active
                  ? `0 15px 35px -5px ${item.color}70, 0 0 20px ${item.color}30`
                  : undefined,
              }}
            >
              {/* Outer pulsing ring on active selection */}
              {active && (
                <>
                  <span
                    className="absolute -inset-1 rounded-3xl animate-ping opacity-30 pointer-events-none"
                    style={{ border: `2px solid ${item.color}` }}
                  />
                  <div
                    className="absolute -top-3 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-md animate-bounce"
                    style={{ backgroundColor: item.color }}
                  >
                    <IconComp className="h-3 w-3" />
                  </div>
                </>
              )}

              {/* 3D Emoji character */}
              <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110 drop-shadow-md">
                {item.emoji}
              </span>

              {/* Text label */}
              <span
                className={`mt-2 text-[11px] font-extrabold tracking-tight transition-all duration-200 ${
                  active ? 'opacity-100 scale-105' : 'opacity-75 group-hover:opacity-100'
                }`}
                style={{ color: active ? item.color : 'inherit' }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


