'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import {
  MessageSquare, CheckCircle2, ChevronRight, AlertCircle,
  Loader2, Mic, MicOff, Copy, ExternalLink, Camera, Gift, Sparkles,
  User, Award, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVIEW_TAGS, type ReviewTag, type RewardSlice } from '@/types/reputation'
import { composeReviewText } from '@/lib/reputation/helpers'
import { ParticleField } from './components/particle-field'
import { StarRating } from './components/star-rating'
import { SpinWheelCard } from './components/spin-wheel-card'

interface V2Settings {
  ownerPhotoUrl: string | null; ownerName: string | null
  welcomeMessage: string | null; brandingColor: string
  logoUrl: string | null; enableSpinWheel: boolean
  enableVoiceReview: boolean; enableAiChips: boolean
  rewardsConfig: RewardSlice[]
}

interface ReviewRequestData {
  id: string; businessName: string; contactName: string
  googleReviewUrl: string; gateReviews: boolean; reviewThreshold: number
  status: string; rating?: number; staffMember?: { name: string; role: string } | null
  loyalty?: { total_visits: number; stamps_count: number } | null
  v2: V2Settings
}

export default function PublicReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ReviewRequestData | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [step, setStep] = useState<'welcome' | 'rating' | 'positive' | 'negative' | 'completed' | 'spin'>('welcome')
  const [feedback, setFeedback] = useState('')
  const [selectedTags, setSelectedTags] = useState<ReviewTag[]>([])
  const [aiText, setAiText] = useState('')
  const [copied, setCopied] = useState(false)
  const [recoveryAction, setRecoveryAction] = useState<string | null>(null)
  const [spinReward, setSpinReward] = useState<{ label: string; emoji: string; discountCode: string; discountPercent?: number; color: string; expiresAt?: string } | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinAngle, setSpinAngle] = useState(0)
  const [loyaltyData, setLoyaltyData] = useState<{ total_visits: number; stamps_count: number } | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const spinAnimationRef = useRef<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/public/reputation/${id}`)
      .then((res) => { if (!res.ok) throw new Error('Review request not found or expired.'); return res.json() })
      .then((payload) => {
        setData(payload.data)
        if (payload.data.loyalty) {
          setLoyaltyData({ total_visits: payload.data.loyalty.total_visits, stamps_count: payload.data.loyalty.stamps_count })
        }
        if (payload.data.rating) { setRating(payload.data.rating); setStep('completed') }
        setLoading(false)
      })
      .catch((err) => { setError(err.message || 'Failed to load feedback page.'); setLoading(false) })
  }, [id])

  const triggerConfetti = useCallback(() => {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#a78bfa', '#34d399', '#fbbf24', '#f59e0b']
    const pieces = Array.from({ length: 90 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: -10 - Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8, size: 5 + Math.random() * 9,
      rotation: Math.random() * 360, drift: -35 + Math.random() * 70,
    }))
    setConfetti(pieces)
    setTimeout(() => setConfetti([]), 3500)
  }, [])

  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; delay: number; size: number; rotation: number; drift: number }[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        setTranscribing(true)
        try {
          const formData = new FormData()
          formData.append('audio', blob, 'recording.webm')
          const res = await fetch('/api/public/reputation/voice', { method: 'POST', body: formData })
          const payload = await res.json()
          setTranscript(payload.data?.text || '')
        } catch { setTranscript('[Transcription failed]') }
        finally { setTranscribing(false) }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch { alert('Microphone access denied. Please allow microphone permissions.') }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false) }
  }

  const goToStep = (next: typeof step) => setStep(next)

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating)
    if (selectedRating === 5) triggerConfetti()
    const threshold = data?.reviewThreshold ?? 4
    const gate = data?.gateReviews ?? true
    if (gate) goToStep(selectedRating >= threshold ? 'positive' : 'negative')
    else goToStep('positive')
  }

  const toggleTag = (tag: ReviewTag) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      setAiText(composeReviewText(next, transcript || undefined))
      return next
    })
  }

  const handleAiGenerate = async () => {
    if (selectedTags.length === 0) return
    setSubmitLoading(true)
    try {
      const res = await fetch('/api/public/reputation/ai-generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags, voiceTranscript: transcript || undefined }),
      })
      const payload = await res.json()
      if (payload.data?.text) setAiText(payload.data.text)
    } catch { setAiText(composeReviewText(selectedTags, transcript || undefined)) }
    finally { setSubmitLoading(false) }
  }

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea'); ta.value = text
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleGoogleReviewClick = async () => {
    if (!id || !data?.googleReviewUrl) return
    setSubmitLoading(true)
    try {
      const res = await fetch(`/api/public/reputation/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'click_google', rating: rating || 5, tagsSelected: selectedTags,
          aiGeneratedText: aiText || undefined, voiceTranscript: transcript || undefined,
          sentimentScore: rating ? (rating - 3) / 2 : 0.5, rewardsConfig: data.v2.rewardsConfig,
        }),
      })
      const payload = await res.json()
      if (payload.reward) { setSpinReward(payload.reward); goToStep('spin') }
      else window.location.href = data.googleReviewUrl
    } catch { window.location.href = data.googleReviewUrl }
    finally { setSubmitLoading(false) }
  }

  const handleSpinWheel = () => {
    if (isSpinning || !spinReward) return
    setIsSpinning(true)
    const extraSpins = 6 + Math.floor(Math.random() * 4)
    const targetAngle = 360 * extraSpins + Math.random() * 360
    const startAngle = spinAngle
    const duration = 4500
    const startTime = performance.now()
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 4)
      setSpinAngle(startAngle + targetAngle * easeOut)
      if (progress < 1) spinAnimationRef.current = requestAnimationFrame(animate)
      else {
        setIsSpinning(false)
        triggerConfetti()
      }
    }
    spinAnimationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => { return () => { if (spinAnimationRef.current) cancelAnimationFrame(spinAnimationRef.current) } }, [])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || rating === null) return
    setSubmitLoading(true)
    try {
      const res = await fetch(`/api/public/reputation/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_feedback', rating, feedback, tagsSelected: selectedTags, recoveryActionRequested: recoveryAction }),
      })
      if (!res.ok) throw new Error('Failed to submit feedback.')
      goToStep('completed')
    } catch { alert('Something went wrong. Please try submitting again.') }
    finally { setSubmitLoading(false) }
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4">
        <ParticleField color="#a78bfa" count={15} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground motion-safe:animate-pulse">Preparing your experience...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 text-center">
        <ParticleField color="#ef4444" count={10} />
        <div className="relative z-10 max-w-md space-y-4 rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Link Expired or Invalid</h2>
          <p className="text-sm text-muted-foreground">This review request link has expired or is no longer valid.</p>
        </div>
      </div>
    )
  }

  const bc = data.v2.brandingColor || '#a78bfa'

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F7F4EE] to-[#EFECE3] px-4 py-8">
      {/* Animated background elements */}
      <ParticleField color="#F59E0B" count={16} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${bc} 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: `radial-gradient(circle, #F59E0B 0%, transparent 70%)` }} />

      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="c-confetti-piece absolute"
              style={{
                left: `${c.x}%`, top: `${c.y}%`,
                width: c.size, height: c.size * 0.6,
                background: c.color,
                borderRadius: '2px',
                animationDelay: `${c.delay}s`,
                '--drift': `${c.drift}px`,
                '--rot': `${c.rotation}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Main card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md overflow-hidden rounded-[40px] border border-stone-100/90 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-500"
      >
        {/* Decorative subtle golden waves at bottom of card */}
        <svg className="absolute bottom-0 inset-x-0 w-full h-24 opacity-[0.10] pointer-events-none z-0" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,60 C150,95 250,25 400,60 L400,100 L0,100 Z" fill="#F59E0B" />
        </svg>

        {/* Animated gradient border */}
        <div className="absolute inset-x-0 top-0 h-[2.5px] opacity-70 motion-safe:animate-gradient-shift z-10"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${bc}40 30%, ${bc} 50%, ${bc}40 70%, transparent 100%)`, backgroundSize: '200% 100%' }} />

        <div className={`transition-all duration-500 ${step === 'welcome' ? '' : ''}`}>
          {/* WELCOME */}
          {step === 'welcome' && (
            <div className="animate-scale-in">
              <div className="p-8 text-center space-y-6">
                {/* Logo or decorative icon */}
                <div className="relative mx-auto flex items-center justify-center">
                  {data.v2.logoUrl ? (
                    <div className="relative motion-safe:animate-float-slow">
{/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={data.v2.logoUrl} alt={data.businessName}
                        className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-2 ring-white/10" />
                      <div className="absolute -inset-2 rounded-3xl border border-white/5" />
                    </div>
                  ) : (
                    <div className="relative motion-safe:animate-float-slow">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${bc}30, ${bc}10)` }}>
                        <Sparkles className="h-10 w-10" style={{ color: bc }} />
                      </div>
                      <div className="absolute -inset-2 rounded-3xl" style={{ border: `1px solid ${bc}20` }} />
                    </div>
                  )}
                </div>

                {data.v2.ownerPhotoUrl && (
                  <div className="flex justify-center -mt-2">
                    <div className="relative motion-safe:animate-float-slow" style={{ animationDelay: '1s' }}>
{/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={data.v2.ownerPhotoUrl} alt={data.v2.ownerName || 'Owner'}
                        className="h-16 w-16 rounded-full object-cover border-4 border-card shadow-lg" style={{ borderColor: bc }} />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {data.v2.ownerName ? `Hi! I'm ${data.v2.ownerName}` : `Welcome to ${data.businessName}`}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {data.v2.welcomeMessage || `${data.contactName}, thank you for visiting ${data.businessName}! We'd love to hear about your experience.`}
                  </p>
                </div>

                {data.staffMember && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm border border-border/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Serviced by <strong>{data.staffMember.name}</strong> ({data.staffMember.role})</span>
                  </div>
                )}

                <Button onClick={() => goToStep('rating')}
                  className="w-full font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.97] h-12 text-base"
                  style={{ backgroundColor: bc }}>
                  Share Your Feedback
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-[10px] text-muted-foreground/50">Your feedback helps us serve you better</p>
              </div>
            </div>
          )}

          {/* RATING */}
          {step === 'rating' && (
            <div className="animate-slide-up px-6 pt-4 pb-6 text-center flex flex-col items-center">
              {/* iOS Sheet Handle Bar */}
              <div className="w-10 h-1 rounded-full bg-stone-300/80 mb-4" />

              {/* Header */}
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#D97706]">
                YOUR EXPERIENCE MATTERS
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-stone-900 tracking-tight">
                {data.v2.ownerName || 'Mayur'}
              </h2>

              {/* Header subtle divider */}
              <div className="w-full border-b border-stone-200/60 my-4" />

              {/* Main Greeting */}
              <div className="space-y-1 my-1">
                <h3 className="text-2xl font-black tracking-tight text-stone-900">
                  Hi {data.contactName || 'Mayur Chouhan'}!
                </h3>
                <p className="text-sm font-medium text-stone-500">
                  How was your experience today?
                </p>
              </div>

              {/* Rating Instruction Pill Container */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFDF5] border border-[#F3E6C8] px-4 py-2 text-xs font-semibold text-stone-600 shadow-2xs my-4">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-400 animate-pulse" />
                <span>Tap an emoji to rate your experience</span>
              </div>

              {/* Interactive Emoji Carousel Component */}
              <StarRating
                value={rating}
                onChange={handleStarClick}
                color={bc}
                contactName={data.contactName}
                ownerName={data.v2.ownerName || 'Mayur'}
                businessName={data.businessName}
              />
            </div>
          )}

          {/* POSITIVE */}
          {step === 'positive' && (
            <div className="animate-scale-in">
              <div className="p-6 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full"
                      style={{ background: `${bc}15` }}>
                      <Sparkles className="h-10 w-10" style={{ color: bc }} />
                    </div>
                    <div className="absolute -inset-1 rounded-full opacity-40 motion-safe:animate-ping"
                      style={{ border: `2px solid ${bc}` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Amazing! Thank You!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Help others discover {data.businessName} by leaving a Google review.
                  </p>
                </div>

                {data.v2.enableAiChips && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">What did you enjoy?</p>
                    <div className="flex flex-wrap justify-center gap-2" style={{ perspective: '800px' }}>
                      {REVIEW_TAGS.map(({ key, emoji }, i) => {
                        const sel = selectedTags.includes(key)
                        return (
                          <button key={key} type="button" onClick={() => toggleTag(key)}
                            className={`tag-chip inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 motion-safe:animate-scale-in ${
                              sel ? 'text-white shadow-md' : 'text-muted-foreground hover:border-foreground/30 hover:text-foreground bg-muted/20'
                            }`}
                            style={{
                              backgroundColor: sel ? bc : undefined,
                              borderColor: sel ? bc : undefined,
                              animationDelay: `${i * 0.04}s`,
                              transform: sel ? 'scale(1.05)' : 'scale(1)',
                            }}>
                            {emoji} {key}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {(selectedTags.length > 0 || transcript) && (
                  <div className="space-y-3 motion-safe:animate-slide-up">
                    <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-4 text-left overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-5" style={{ background: `radial-gradient(circle, ${bc}, transparent)` }} />
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" style={{ color: bc }} />
                        AI-Generated Review
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        &ldquo;{aiText || composeReviewText(selectedTags, transcript || undefined)}&rdquo;
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="xs" onClick={() => copyToClipboard(aiText || composeReviewText(selectedTags, transcript || undefined))}
                          className="text-xs h-8">
                          {copied ? <><CheckCircle2 className="mr-1 h-3 w-3" /> Copied</> : <><Copy className="mr-1 h-3 w-3" /> Copy</>}
                        </Button>
                        {selectedTags.length > 0 && (
                          <Button variant="outline" size="xs" onClick={handleAiGenerate} disabled={submitLoading} className="text-xs h-8">
                            {submitLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <><Sparkles className="mr-1 h-3 w-3" /> Polish</>}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {data.v2.enableVoiceReview && (
                  <div className="space-y-3 p-3 rounded-xl bg-muted/10 border border-border/40">
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">Record a voice review</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button variant={isRecording ? 'destructive' : 'outline'} size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center gap-2 transition-all ${isRecording ? 'shadow-lg shadow-rose-500/20 motion-safe:animate-pulse' : ''}`}>
                        {isRecording ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> Record</>}
                      </Button>
                      {transcribing && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Transcribing...</span>}
                    </div>
                    {transcript && <p className="text-xs text-muted-foreground italic bg-muted/20 rounded-lg p-3 border border-border/30">&ldquo;{transcript}&rdquo;</p>}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button onClick={handleGoogleReviewClick} disabled={submitLoading}
                    className="w-full font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.97] h-12 text-base"
                    style={{ backgroundColor: bc, boxShadow: `0 4px 20px ${bc}30` }}>
                    {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><ExternalLink className="mr-2 h-4 w-4" /> Write Review on Google</>}
                  </Button>
                  <button type="button" onClick={() => goToStep('rating')}
                    className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors underline underline-offset-2">
                    Change my rating
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NEGATIVE */}
          {step === 'negative' && (
            <form onSubmit={handleFeedbackSubmit} className="animate-slide-up">
              <div className="p-6 space-y-5">
                <div className="space-y-2 text-center">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 motion-safe:animate-float-slow">
                      <MessageSquare className="h-8 w-8 text-rose-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">We&rsquo;re Sorry</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    We apologize your experience didn&rsquo;t meet expectations. Your feedback helps us improve.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground tracking-wide">How can we make it right?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'manager_call', label: 'Manager Call', emoji: '📞' },
                      { value: 'refund', label: 'Refund', emoji: '💰' },
                      { value: 'replace', label: 'Replacement', emoji: '🔄' },
                      { value: 'coupon', label: 'Discount Coupon', emoji: '🎫' },
                    ].map((action) => (
                      <button key={action.value} type="button"
                        onClick={() => setRecoveryAction(recoveryAction === action.value ? null : action.value)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 text-xs font-medium transition-all duration-200 ${
                          recoveryAction === action.value
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/10'
                        }`}>
                        <span className="text-xl">{action.emoji}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {data.v2.enableAiChips && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">What went wrong?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {REVIEW_TAGS.map(({ key, emoji }) => (
                        <button key={key} type="button" onClick={() => toggleTag(key)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                            selectedTags.includes(key)
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                              : 'border-border text-muted-foreground hover:border-foreground/30'
                          }`}>
                          {emoji} {key}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what went wrong..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-muted/20 p-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background focus:ring-1 focus:ring-primary/20" />

                <div className="space-y-2 pt-1">
                  <Button type="submit" disabled={submitLoading || (!feedback.trim() && !recoveryAction)}
                    className="w-full font-semibold text-white transition-all duration-200 active:scale-[0.97] h-12"
                    style={{ backgroundColor: bc }}>
                    {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Private Feedback'}
                  </Button>
                  <div className="text-center">
                    <button type="button" onClick={() => goToStep('rating')}
                      className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors underline underline-offset-2">
                      Change my rating
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* SPIN WHEEL */}
          {step === 'spin' && spinReward && (
            <div className="animate-scale-in">
              <SpinWheelCard
                rewardsConfig={data.v2.rewardsConfig}
                spinReward={spinReward}
                brandingColor={bc}
                onClaimReviewClick={() => {
                  if (data.googleReviewUrl) window.location.href = data.googleReviewUrl
                }}
              />
            </div>
          )}

          {/* COMPLETED */}
          {step === 'completed' && (
            <div className="animate-scale-in">
              <div className="p-8 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                      <svg viewBox="0 0 40 40" className="h-12 w-12">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#10b981" strokeWidth="2"
                          className="c-check-ring" />
                        <path d="M12 20 L18 26 L28 14" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          className="c-check-path" />
                      </svg>
                    </div>
                    <div className="absolute -inset-2 rounded-full opacity-30 motion-safe:animate-ping"
                      style={{ border: `2px solid #10b981` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Thank You!</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    Your feedback has been submitted to <strong>{data.businessName}</strong>. We truly appreciate your time.
                  </p>
                </div>

                {/* Loyalty Card */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-amber-500/[0.07] to-amber-500/[0.02] p-5 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-bold text-foreground">Loyalty Card</span>
                    <span className="ml-auto text-xs text-muted-foreground">{data.businessName}</span>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className={`c-stamp relative h-12 w-12 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                        s <= (loyaltyData?.stamps_count || 1)
                          ? 'border-amber-400 bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md'
                          : 'border-muted-foreground/20 text-muted-foreground/30'
                      }`}
                        style={{ animationDelay: `${s * 0.1}s` }}>
                        {s <= (loyaltyData?.stamps_count || 1) ? '⭐' : s}
                        {s <= (loyaltyData?.stamps_count || 1) && (
                          <div className="absolute -inset-0.5 rounded-xl opacity-20 motion-safe:animate-ping"
                            style={{ border: `2px solid #f59e0b` }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    {(loyaltyData?.stamps_count || 1)} / 5 visits completed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'rating' && (
          <div className="border-t border-border/30 bg-muted/5 px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <Camera className="h-3 w-3 text-muted-foreground/40" />
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Powered by <span className="font-semibold text-muted-foreground/70">{data.businessName}</span> Experience Platform
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Confetti */
        .c-confetti-piece {
          animation: c-fall 3s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s) forwards;
        }
        @keyframes c-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.3); opacity: 0; }
        }

        /* Animated checkmark */
        .c-check-ring { stroke-dasharray: 113; stroke-dashoffset: 113; animation: c-draw-ring 0.6s ease-out 0.2s forwards; }
        .c-check-path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: c-draw-check 0.4s ease-out 0.6s forwards; }
        @keyframes c-draw-ring { to { stroke-dashoffset: 0; } }
        @keyframes c-draw-check { to { stroke-dashoffset: 0; } }

        /* Stamp reveal */
        .c-stamp {
          animation: c-stamp-reveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay, 0s) both;
        }
        @keyframes c-stamp-reveal {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* Tag chip hover */
        .tag-chip { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .tag-chip:hover { transform: scale(1.08) !important; }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .c-confetti-piece { animation: none !important; display: none; }
          .c-check-ring, .c-check-path { animation: none !important; stroke-dashoffset: 0; }
          .c-stamp { animation: none !important; }
        }

        /* Utility classes */
        .animate-fade-out { animation: c-fade-out 0.2s ease-out forwards; }
        @keyframes c-fade-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  )
}
