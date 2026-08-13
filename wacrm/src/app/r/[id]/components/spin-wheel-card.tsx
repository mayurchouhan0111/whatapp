'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Gift, Copy, CheckCircle2, Award, Clock, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RewardSlice } from '@/types/reputation'

export interface SpinRewardData {
  label: string
  emoji: string
  discountCode: string
  discountPercent?: number
  color?: string
  expiresAt?: string
}

interface SpinWheelCardProps {
  rewardsConfig?: RewardSlice[]
  spinReward: SpinRewardData | null
  brandingColor?: string
  onSpinComplete?: (reward: SpinRewardData) => void
  onClaimReviewClick?: () => void
}

// Default prize slices if configuration is missing or sparse
const DEFAULT_SLICES: RewardSlice[] = [
  { label: '₹200 OFF', emoji: '💵', color: '#2563EB', probability: 1 },
  { label: '50% OFF', emoji: '🏷️', color: '#DB2777', probability: 1 },
  { label: 'Free Drink', emoji: '☕', color: '#EA580C', probability: 1 },
  { label: '₹100 OFF', emoji: '👛', color: '#10B981', probability: 1 },
  { label: 'Flat ₹50 OFF', emoji: '🛍️', color: '#EAB308', probability: 1 },
  { label: 'Lucky Coupon', emoji: '⭐', color: '#9333EA', probability: 1 },
  { label: 'Free Dessert', emoji: '🍰', color: '#854D0E', probability: 1 },
  { label: '₹500 OFF', emoji: '💸', color: '#1E40AF', probability: 1 },
]

// Synthesized audio clicks using Web Audio API
function playTickSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.03)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.03)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.035)
  } catch {}
}

function playWinSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09)
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.09)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.09)
      osc.stop(ctx.currentTime + i * 0.09 + 0.36)
    })
  } catch {}
}

export function SpinWheelCard({
  rewardsConfig,
  spinReward,
  brandingColor = '#F59E0B',
  onSpinComplete,
  onClaimReviewClick,
}: SpinWheelCardProps) {
  // Use configured slices or rich defaults
  const slices = rewardsConfig && rewardsConfig.length >= 4 ? rewardsConfig : DEFAULT_SLICES
  const sliceCount = slices.length
  const sliceAngle = 360 / sliceCount

  // Wheel state machine
  const [wheelState, setWheelState] = useState<'IDLE' | 'SPINNING' | 'WON' | 'REWARD_REVEALED'>('IDLE')
  const [rotationAngle, setRotationAngle] = useState<number>(0)
  const [pointerTilt, setPointerTilt] = useState<number>(0)
  const [hubWobble, setHubWobble] = useState<number>(0)
  const [winningIndex, setWinningIndex] = useState<number | null>(null)
  const [btnScale, setBtnScale] = useState<number>(1)
  const [copied, setCopied] = useState<boolean>(false)

  const animFrameRef = useRef<number | null>(null)
  const lastSliceTickRef = useRef<number>(-1)
  const rotationRef = useRef<number>(0)

  // Sync rotationRef
  useEffect(() => {
    rotationRef.current = rotationAngle
  }, [rotationAngle])

  // Determine target index based on spinReward prop or slice search
  const getTargetIndex = useCallback(() => {
    if (spinReward) {
      const matchIdx = slices.findIndex(
        (s) => s.label.toLowerCase() === spinReward.label.toLowerCase() || s.emoji === spinReward.emoji
      )
      if (matchIdx !== -1) return matchIdx
    }
    return Math.floor(Math.random() * sliceCount)
  }, [spinReward, slices, sliceCount])

  // Main physics-driven spin execution
  const handleSpinClick = () => {
    if (wheelState !== 'IDLE') return

    // Button press physics bounce
    setBtnScale(0.94)
    setTimeout(() => setBtnScale(1.04), 100)
    setTimeout(() => setBtnScale(1.0), 220)

    // Trigger haptic vibration on start
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(35) } catch {}
    }

    setWheelState('SPINNING')

    const targetIdx = getTargetIndex()
    setWinningIndex(targetIdx)

    // Calculate exact stopping angle so pointer (at top, 270 deg) lands on center of winning slice
    // Slice center angle from 0 deg = (targetIdx + 0.5) * sliceAngle
    // Top pointer is at -90 deg (270 deg). So target rotation = 270 - sliceCenterAngle + N * 360
    const sliceCenterAngle = (targetIdx + 0.5) * sliceAngle
    const targetBaseAngle = (270 - sliceCenterAngle + 3600) % 360
    
    // Add 6 to 8 full rotations for high velocity feel
    const fullSpins = (6 + Math.floor(Math.random() * 2)) * 360
    const currentAngle = rotationRef.current % 360
    const totalDelta = fullSpins + ((targetBaseAngle - currentAngle + 360) % 360)
    const finalAngle = rotationRef.current + totalDelta

    const duration = 4800 // Total physics duration ms
    const startTime = performance.now()
    const startAngle = rotationRef.current

    const updatePhysics = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      let currentRot = startAngle

      if (progress < 0.2) {
        // Acceleration phase (ease-in quad)
        const p = progress / 0.2
        const easeIn = p * p
        currentRot = startAngle + totalDelta * 0.15 * easeIn
      } else if (progress < 0.75) {
        // High speed / Deceleration phase (smooth cubic)
        const p = (progress - 0.2) / 0.55
        const easeOut = 1 - Math.pow(1 - p, 2.5)
        currentRot = startAngle + totalDelta * 0.15 + totalDelta * 0.78 * easeOut
      } else {
        // Final Spring & Micro-Overshoot Settling phase
        const p = (progress - 0.75) / 0.25
        // Over-shoot by ~3.5 deg and settle
        const overshoot = Math.sin(p * Math.PI * 1.5) * (1 - p) * 3.5
        currentRot = finalAngle + overshoot
      }

      setRotationAngle(currentRot)
      rotationRef.current = currentRot

      // Pointer flicking reaction as wheel passes segments
      // Calculate current slice under pointer
      const normalizedAngle = (270 - (currentRot % 360) + 360) % 360
      const currentSliceIdx = Math.floor(normalizedAngle / sliceAngle)

      if (currentSliceIdx !== lastSliceTickRef.current) {
        lastSliceTickRef.current = currentSliceIdx
        
        // Pointer flick angle (up to 20 deg)
        const speedRatio = 1 - progress
        setPointerTilt(Math.min(22, 12 + speedRatio * 10))
        setTimeout(() => setPointerTilt(-4), 50)
        setTimeout(() => setPointerTilt(0), 110)

        // Play tick sound & light haptic
        playTickSound()
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(6) } catch {}
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(updatePhysics)
      } else {
        // Wheel stopped cleanly at target winning index
        setRotationAngle(finalAngle)
        setPointerTilt(0)
        setHubWobble(4)
        setTimeout(() => setHubWobble(-2), 120)
        setTimeout(() => setHubWobble(0), 240)

        // Win fanfare, heavy haptic & state transition
        playWinSound()
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([40, 60, 100]) } catch {}
        }

        setWheelState('WON')

        // Cinematic pause before revealing floating VIP coupon card
        setTimeout(() => {
          setWheelState('REWARD_REVEALED')
          if (onSpinComplete && spinReward) {
            onSpinComplete(spinReward)
          }
        }, 500)
      }
    }

    animFrameRef.current = requestAnimationFrame(updatePhysics)
  }

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Copy coupon code handler
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const activeWinningSlice = winningIndex !== null ? slices[winningIndex] : null

  return (
    <div className="w-full flex flex-col items-center select-none px-1 py-2">
      {/* 2. HEADER ICON CONTAINER */}
      <div className="relative mb-3 flex justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200/80 border border-amber-300/80 shadow-[0_8px_25px_rgba(245,158,11,0.25)] animate-scale-in">
          {/* Inner highlight & subtle ambient outer glow */}
          <div className="absolute inset-1 rounded-full border border-white/60 pointer-events-none" />
          <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-md pointer-events-none" />
          <span className="text-3xl drop-shadow-md animate-bounce" style={{ animationDuration: '2.5s' }}>
            🎁
          </span>
        </div>
      </div>

      {/* 3. REWARD BADGE */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border border-amber-400/30 px-3.5 py-1 text-[11px] font-extrabold text-amber-700 uppercase tracking-wider shadow-2xs mb-3">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-400 animate-pulse" />
        <span>EXCLUSIVE GUEST REWARD</span>
      </div>

      {/* 4. TITLE & DESCRIPTION */}
      <div className="text-center space-y-1.5 max-w-xs mx-auto mb-5">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Spin & Win Rewards!
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
          Thanks for sharing your review! Tap spin to reveal your special discount coupon for your next visit.
        </p>
      </div>

      {/* 5. THE WHEEL — HERO COMPONENT */}
      <div className="relative w-full max-w-[310px] sm:max-w-[330px] aspect-square flex items-center justify-center my-2">
        {/* Layer 1: Ambient Outer Glow */}
        <div
          className={`absolute inset-1 rounded-full transition-all duration-500 pointer-events-none ${
            wheelState === 'SPINNING' ? 'opacity-70 blur-2xl scale-105' : 'opacity-35 blur-xl'
          }`}
          style={{ background: `radial-gradient(circle, ${brandingColor} 0%, transparent 70%)` }}
        />

        {/* Layer 2 & 3: Metallic Outer Bezel & Lights SVG Container */}
        <div className="relative w-full h-full p-2.5">
          <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible drop-shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
            <defs>
              {/* Metallic Gold Gradient Rim */}
              <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE259" />
                <stop offset="25%" stopColor="#FFA751" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="75%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>

              {/* Inner Dark Rim Shadow Gradient */}
              <radialGradient id="inner-rim-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="85%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </radialGradient>

              {/* Center Hub Metal Gradient */}
              <radialGradient id="center-hub-metal" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#F3F4F6" />
                <stop offset="85%" stopColor="#E5E7EB" />
                <stop offset="100%" stopColor="#D1D5DB" />
              </radialGradient>

              {/* Shadow filter for slices */}
              <filter id="slice-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
              </filter>

              {/* Pointer Drop Shadow */}
              <filter id="pointer-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Golden Outer Bezel */}
            <circle cx="150" cy="150" r="146" fill="url(#gold-rim)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            <circle cx="150" cy="150" r="139" fill="#1C1917" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Perimeter LED Light Bulbs */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 22.5 * Math.PI) / 180
              const bx = 150 + 142.5 * Math.cos(angle)
              const by = 150 + 142.5 * Math.sin(angle)
              const isGlowing = wheelState === 'SPINNING' ? (i + Math.floor(rotationAngle / 30)) % 2 === 0 : i % 2 === 0
              return (
                <g key={i}>
                  <circle
                    cx={bx}
                    cy={by}
                    r="3.2"
                    fill={isGlowing ? '#FFFBEB' : '#FEF08A'}
                    stroke="#D97706"
                    strokeWidth="0.8"
                    className="transition-all duration-150"
                  />
                  {isGlowing && (
                    <circle cx={bx} cy={by} r="5" fill="#FEF08A" opacity="0.4" className="animate-ping" />
                  )}
                </g>
              )
            })}

            {/* Layer 5: Dynamic Spinning Wheel Slices */}
            <g
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transformOrigin: '150px 150px',
                transition: wheelState === 'SPINNING' ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              {slices.map((slice, i) => {
                const offset = i * sliceAngle
                const radStart = (offset * Math.PI) / 180
                const radEnd = ((offset + sliceAngle) * Math.PI) / 180
                const midAngle = offset + sliceAngle / 2
                const radMid = (midAngle * Math.PI) / 180

                const r = 134
                const cx = 150, cy = 150
                const x1 = cx + r * Math.cos(radStart)
                const y1 = cy + r * Math.sin(radStart)
                const x2 = cx + r * Math.cos(radEnd)
                const y2 = cy + r * Math.sin(radEnd)

                const isWinningSlice = wheelState === 'WON' || wheelState === 'REWARD_REVEALED' ? i === winningIndex : false

                return (
                  <g key={i}>
                    {/* Prize Slice Sector */}
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={slice.color}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.5"
                      filter="url(#slice-shadow)"
                      className={isWinningSlice ? 'brightness-125 saturate-150 transition-all duration-300' : ''}
                    />

                    {/* Slice Separator Accent Line */}
                    <line x1={cx} y1={cy} x2={x1} y2={y1} stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

                    {/* Slice Content (Emoji & Label text) */}
                    <g
                      transform={`translate(${cx + 88 * Math.cos(radMid)}, ${cy + 88 * Math.sin(radMid)}) rotate(${midAngle + 90})`}
                    >
                      <text
                        x="0"
                        y="-12"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="20"
                        className="drop-shadow-md"
                      >
                        {slice.emoji}
                      </text>
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="800"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                        }}
                      >
                        {slice.label}
                      </text>
                    </g>
                  </g>
                )
              })}
            </g>

            {/* Inner Rim Shadow Overlay */}
            <circle cx="150" cy="150" r="134" fill="url(#inner-rim-shadow)" pointerEvents="none" />

            {/* Layer 7: Mechanical Center Hub */}
            <g style={{ transform: `scale(${1 + hubWobble * 0.01})`, transformOrigin: '150px 150px' }}>
              <circle cx="150" cy="150" r="34" fill="url(#gold-rim)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
              <circle cx="150" cy="150" r="28" fill="url(#center-hub-metal)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
              <circle cx="150" cy="150" r="14" fill="#F59E0B" opacity="0.15" />
              <text x="150" y="152" textAnchor="middle" dominantBaseline="middle" fontSize="18">
                🎁
              </text>
            </g>

            {/* 8. SPRING-LOADED MECHANICAL POINTER */}
            <g
              filter="url(#pointer-shadow)"
              style={{
                transform: `rotate(${pointerTilt}deg)`,
                transformOrigin: '150px 18px',
                transition: wheelState === 'SPINNING' ? 'transform 0.05s ease-out' : 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}
            >
              {/* Pointer Body */}
              <path
                d="M 150 42 L 138 12 C 138 6 162 6 162 12 Z"
                fill="#DC2626"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <path d="M 150 40 L 142 14 C 146 12 154 12 158 14 Z" fill="#EF4444" />
              {/* Golden Bolt Cap */}
              <circle cx="150" cy="16" r="4.5" fill="url(#gold-rim)" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="150" cy="16" r="2" fill="#78350F" />
            </g>
          </svg>
        </div>
      </div>

      {/* 12. PHYSICAL SPIN BUTTON */}
      <div className="w-full max-w-[300px] mt-4 mb-2">
        <Button
          onClick={handleSpinClick}
          disabled={wheelState !== 'IDLE'}
          className="w-full h-14 rounded-full font-black text-white text-sm sm:text-base tracking-wide shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-90 cursor-pointer overflow-hidden relative group"
          style={{
            transform: `scale(${btnScale})`,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
            boxShadow: wheelState === 'IDLE' ? '0 10px 30px rgba(217, 119, 6, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none',
          }}
        >
          {/* Shimmer light bar across button */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {wheelState === 'SPINNING' ? (
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-white" />
              <span>SPINNING THE WHEEL...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🎡</span>
              <span>TAP TO SPIN THE WHEEL</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          )}
        </Button>
      </div>

      {/* 20. FLOATING VIP COUPON CARD REVEAL */}
      {wheelState === 'REWARD_REVEALED' && spinReward && (
        <div className="w-full max-w-[340px] mt-5 animate-slide-up">
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 p-6 shadow-2xl backdrop-blur-xl text-center">
            {/* Ambient Background Blur Glow */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-amber-400/30 blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-600 mb-1">
              <Award className="h-4 w-4 text-amber-500" /> VIP Discount Voucher
            </div>

            <div className="my-3">
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {spinReward.emoji} {spinReward.label}
              </p>
              {spinReward.discountPercent && spinReward.discountPercent > 0 && (
                <div className="mt-1.5 inline-block rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-700">
                  {spinReward.discountPercent}% OFF on Next Visit!
                </div>
              )}
            </div>

            {/* Coupon Code Box */}
            {spinReward.discountCode && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white border-2 border-dashed border-amber-400/60 p-3.5 shadow-sm">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Coupon Code</p>
                  <code className="text-base sm:text-lg font-black tracking-widest text-amber-600 font-mono">
                    {spinReward.discountCode}
                  </code>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyCode(spinReward.discountCode)}
                  className="text-xs font-bold gap-1.5 shadow-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-amber-600" /> Copy
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Expiry Date Badge */}
            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-500/20">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>
                Valid Until: <strong>{spinReward.expiresAt || '15 Days from today'}</strong>
              </span>
            </div>

            {/* Claim Action Button */}
            {onClaimReviewClick && (
              <Button
                onClick={onClaimReviewClick}
                className="w-full mt-5 h-12 text-sm font-bold text-white shadow-lg rounded-2xl transition-all duration-200 active:scale-97"
                style={{ backgroundColor: brandingColor }}
              >
                Post Review on Google to Claim
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Trust Badges Footer */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-2 text-[11px] text-stone-400 font-semibold border-t border-stone-100 w-full max-w-[320px]">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>100% Genuine</span>
        </div>
        <div className="h-3 w-px bg-stone-200" />
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span>Instant Discounts</span>
        </div>
      </div>
    </div>
  )
}
