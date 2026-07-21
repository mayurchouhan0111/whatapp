'use client'

import { use, useEffect, useState, useCallback, useRef } from 'react'
import {
  MessageSquare, CheckCircle2, ChevronRight, AlertCircle,
  Loader2, Mic, MicOff, Copy, ExternalLink, Camera, Gift, Sparkles,
  User, Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REVIEW_TAGS, type ReviewTag, type RewardSlice } from '@/types/reputation'
import { composeReviewText } from '@/lib/reputation/helpers'
import { ParticleField } from './components/particle-field'
import { StarRating } from './components/star-rating'

interface V2Settings {
  ownerPhotoUrl: string | null; ownerName: string | null
  welcomeMessage: string | null; brandingColor: string
  logoUrl: string | null; enableSpinWheel: boolean
  enableVoiceReview: boolean; enableAiChips: boolean
  rewardsConfig: RewardSlice[]
}

interface ReviewRequestData {
  id: string; businessName: string; contactName: string; contactPhone: string
  googleReviewUrl: string; gateReviews: boolean; reviewThreshold: number
  status: string; rating?: number; staffMember?: { name: string; role: string } | null
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
  const [spinReward, setSpinReward] = useState<{ label: string; emoji: string; discountCode: string; discountPercent?: number; color: string } | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinAngle, setSpinAngle] = useState(0)
  const [loyaltyData] = useState<{ total_visits: number; stamps_count: number } | null>(null)

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
        if (payload.data.rating) { setRating(payload.data.rating); setStep('completed') }
        setLoading(false)
      })
      .catch((err) => { setError(err.message || 'Failed to load feedback page.'); setLoading(false) })
  }, [id])

  const triggerConfetti = useCallback(() => {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#a78bfa', '#34d399']
    const pieces = Array.from({ length: 80 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: -10 - Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8, size: 4 + Math.random() * 8,
      rotation: Math.random() * 360, drift: -30 + Math.random() * 60,
    }))
    setConfetti(pieces)
    setTimeout(() => setConfetti([]), 3000)
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
    const extraSpins = 5 + Math.floor(Math.random() * 5)
    const targetAngle = 360 * extraSpins + Math.random() * 360
    const startAngle = spinAngle
    const duration = 4000
    const startTime = performance.now()
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setSpinAngle(startAngle + targetAngle * easeOut)
      if (progress < 1) spinAnimationRef.current = requestAnimationFrame(animate)
      else setIsSpinning(false)
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4 py-12">
      {/* Animated background elements */}
      <ParticleField color={bc} count={25} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${bc} 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${bc} 0%, transparent 70%)` }} />

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
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-[0_0_40px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-x-0 top-0 h-[2px] opacity-60 motion-safe:animate-gradient-shift"
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
            <div className="animate-slide-up">
              <div className="border-b border-border/50 bg-muted/10 px-6 py-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: bc }}>Your Experience Matters</p>
                <h2 className="mt-1 text-lg font-bold text-foreground truncate">{data.businessName}</h2>
              </div>
              <div className="p-6 space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Hi {data.contactName}!</h3>
                  <p className="text-sm text-muted-foreground">How was your experience today?</p>
                </div>

                <StarRating value={rating} onChange={handleStarClick} color={bc} />

                <p className="text-xs text-muted-foreground/60">Your feedback is securely logged and highly valued</p>
              </div>
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
              <div className="p-6 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 motion-safe:animate-float-slow">
                      <Gift className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">You Won!</h3>
                  <p className="text-sm text-muted-foreground">Thanks for your review! Spin the wheel to reveal your reward.</p>
                </div>

                {/* Premium spin wheel */}
                <div className="relative mx-auto h-60 w-60">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full opacity-20 motion-safe:animate-pulse-soft"
                    style={{ boxShadow: `0 0 40px 10px ${bc}40` }} />
                  <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-xl">
                    <defs>
                      <filter id="wheel-shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                      </filter>
                      <radialGradient id="center-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#f0f0f0" />
                      </radialGradient>
                    </defs>
                    {data.v2.rewardsConfig.map((slice, i) => {
                      const totalProb = data.v2.rewardsConfig.reduce((s, r) => s + r.probability, 0)
                      const sliceAngle = (slice.probability / totalProb) * 360
                      const offset = data.v2.rewardsConfig.slice(0, i).reduce((s, r) => s + (r.probability / totalProb) * 360, 0)
                      const midAngle = offset + sliceAngle / 2
                      const rad = (midAngle * Math.PI) / 180
                      const r = 82
                      const cx = 100, cy = 100
                      const x1 = cx + r * Math.cos((offset * Math.PI) / 180)
                      const y1 = cy + r * Math.sin((offset * Math.PI) / 180)
                      const x2 = cx + r * Math.cos(((offset + sliceAngle) * Math.PI) / 180)
                      const y2 = cy + r * Math.sin(((offset + sliceAngle) * Math.PI) / 180)
                      const largeArc = sliceAngle > 180 ? 1 : 0
                      return (
                        <g key={i} style={{ transform: `rotate(${spinAngle}deg)`, transformOrigin: '100px 100px' }}>
                          <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={slice.color} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" filter="url(#wheel-shadow)" />
                          <text x={cx + 55 * Math.cos(rad)} y={cy + 55 * Math.sin(rad)}
                            textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="bold">
                            {slice.emoji}
                          </text>
                        </g>
                      )
                    })}
                    {/* Outer ring */}
                    <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                    {/* Tick marks on outer ring */}
                    {Array.from({ length: 24 }).map((_, i) => (
                      <line key={i} x1={100 + 85 * Math.cos((i * 15 * Math.PI) / 180)}
                        y1={100 + 85 * Math.sin((i * 15 * Math.PI) / 180)}
                        x2={100 + 88 * Math.cos((i * 15 * Math.PI) / 180)}
                        y2={100 + 88 * Math.sin((i * 15 * Math.PI) / 180)}
                        stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    ))}
                    {/* Center hub */}
                    <circle cx="100" cy="100" r="20" fill="url(#center-grad)" stroke="#ddd" strokeWidth="2" />
                    <circle cx="100" cy="100" r="6" fill="#888" />
                    {/* Pointer */}
                    <polygon points="100,2 94,18 106,18" fill={bc} stroke="white" strokeWidth="1.5" />
                    <circle cx="100" cy="12" r="2" fill="white" />
                  </svg>
                </div>

                <Button onClick={handleSpinWheel} disabled={isSpinning}
                  className="w-full font-semibold text-white shadow-lg transition-all duration-200 active:scale-[0.97] h-12 text-base"
                  style={{ backgroundColor: bc, boxShadow: `0 4px 20px ${bc}30` }}>
                  {isSpinning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Spinning...</> : <>{spinReward.emoji} Spin the Wheel!</>}
                </Button>

                {!isSpinning && spinAngle > 0 && (
                  <div className="space-y-3 animate-scale-in">
                    <div className="rounded-xl border-2 p-4 bg-gradient-to-br from-muted/20 to-muted/5"
                      style={{ borderColor: spinReward.color }}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 tracking-wide">Your Reward</p>
                      <p className="text-lg font-bold">{spinReward.emoji} {spinReward.label}</p>
                      {spinReward.discountCode && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 border border-border/50">
                          <code className="text-sm font-bold tracking-widest">{spinReward.discountCode}</code>
                          <button onClick={() => copyToClipboard(spinReward.discountCode!)}
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      {spinReward.discountPercent && spinReward.discountPercent > 0 && (
                        <p className="text-sm font-semibold mt-1" style={{ color: spinReward.color }}>{spinReward.discountPercent}% OFF your next visit!</p>
                      )}
                    </div>

                    <Button onClick={async () => {
                      try { await fetch(`/api/public/reputation/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'click_google', rating: rating || 5 }) }) } catch {}
                      if (data.googleReviewUrl) window.location.href = data.googleReviewUrl
                    }} variant="outline" className="w-full h-12">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Continue to Google Review
                    </Button>
                  </div>
                )}
              </div>
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
        <div className="border-t border-border/30 bg-muted/5 px-6 py-3">
          <div className="flex items-center justify-center gap-2">
            <Camera className="h-3 w-3 text-muted-foreground/40" />
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Powered by <span className="font-semibold text-muted-foreground/70">{data.businessName}</span> Experience Platform
            </p>
          </div>
        </div>
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
