'use client'

import { useState } from 'react'

const EMOJI_MAP: Record<number, { emoji: string; label: string; color: string; bg: string }> = {
  1: { emoji: '😡', label: 'Terrible', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  2: { emoji: '😕', label: 'Poor', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
  3: { emoji: '😊', label: 'Good', color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' },
  4: { emoji: '😍', label: 'Great', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  5: { emoji: '🤩', label: 'Amazing', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
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

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-4 py-3">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover !== null ? hover === star : value === star
        const isPastActive = value !== null && star <= value
        const item = EMOJI_MAP[star]

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className={`group relative flex flex-col items-center justify-center rounded-2xl p-2.5 sm:p-3 transition-all duration-300 outline-none select-none ${
              active
                ? 'scale-115 -translate-y-2 shadow-xl'
                : 'hover:scale-110 hover:-translate-y-1'
            }`}
            style={{
              background: active ? item.bg : isPastActive ? `${item.color}10` : 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${active ? item.color : isPastActive ? `${item.color}40` : 'rgba(255, 255, 255, 0.1)'}`,
              boxShadow: active ? `0 12px 25px -5px ${item.color}50` : undefined,
            }}
          >
            {/* Glowing aura ring on active */}
            {active && (
              <span
                className="absolute inset-0 rounded-2xl animate-ping opacity-30 pointer-events-none"
                style={{ border: `2px solid ${item.color}` }}
              />
            )}

            {/* Emoji display */}
            <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110">
              {item.emoji}
            </span>

            {/* Label below emoji */}
            <span
              className={`mt-1.5 text-[11px] font-bold tracking-tight transition-all duration-200 ${
                active ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-100'
              }`}
              style={{ color: active ? item.color : 'inherit' }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

