'use client'

import { useState } from 'react'

const EMOJI_MAP: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😡', label: 'Very Bad' },
  2: { emoji: '😕', label: 'Average' },
  3: { emoji: '😊', label: 'Good' },
  4: { emoji: '😍', label: 'Great' },
  5: { emoji: '🤩', label: 'Amazing' },
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
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover !== null ? hover >= star : value !== null && value >= star
        const emoji = EMOJI_MAP[star]

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="s-star-btn group relative outline-none"
            style={{ '--sc': color } as React.CSSProperties}
          >
            <svg
              viewBox="0 0 60 60"
              className="s-star-svg"
              width={star === 5 ? 68 : star === 1 ? 52 : 60}
              height={star === 5 ? 68 : star === 1 ? 52 : 60}
            >
              <defs>
                <radialGradient id={`sg-${star}`} cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect
                x="4" y="4" width="52" height="52" rx="14"
                className="s-star-bg"
                fill={active ? `${color}20` : 'transparent'}
                stroke={active ? color : 'var(--border, #333)'}
                strokeWidth="1.5"
              />
              <text
                x="30" y="38" textAnchor="middle" fontSize="26"
                className="s-star-emoji"
                style={{ filter: active ? 'none' : 'grayscale(1)' }}
              >
                {emoji.emoji}
              </text>
              {active && (
                <circle cx="30" cy="18" r="8" fill={`${color}30`} className="s-star-glow" />
              )}
            </svg>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {emoji.label}
            </span>
          </button>
        )
      })}
      <style jsx global>{`
        .s-star-btn {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .s-star-btn:hover {
          transform: scale(1.15);
        }
        .s-star-btn:active {
          transform: scale(0.92);
        }
        .s-star-svg {
          overflow: visible;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .s-star-btn:hover .s-star-svg {
          transform: translateY(-3px);
        }
        .s-star-bg {
          transition: all 0.3s ease;
        }
        .s-star-btn:hover .s-star-bg {
          fill: var(--sc, #a78bfa) !important;
          opacity: 0.15;
          stroke: var(--sc, #a78bfa) !important;
        }
        .s-star-emoji {
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .s-star-btn:hover .s-star-emoji {
          filter: none !important;
          transform: scale(1.05);
        }
        .s-star-glow {
          animation: s-pulse 2s ease-in-out infinite;
        }
        @keyframes s-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .s-star-btn { transition: none; }
          .s-star-btn:hover { transform: none; }
          .s-star-svg { transition: none; }
          .s-star-btn:hover .s-star-svg { transform: none; }
          .s-star-glow { animation: none; }
        }
      `}</style>
    </div>
  )
}
