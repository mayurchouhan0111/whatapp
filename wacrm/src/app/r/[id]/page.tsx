'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  Copy,
  ExternalLink,
  Camera,
  Gift,
  Sparkles,
  RotateCcw,
  User,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RATING_EMOJIS,
  REVIEW_TAGS,
  DEFAULT_REWARDS,
  type ReviewTag,
  type RewardSlice,
} from '@/types/reputation';
import { composeReviewText } from '@/lib/reputation/helpers';

interface V2Settings {
  ownerPhotoUrl: string | null;
  ownerName: string | null;
  welcomeMessage: string | null;
  brandingColor: string;
  logoUrl: string | null;
  enableSpinWheel: boolean;
  enableVoiceReview: boolean;
  enableAiChips: boolean;
  rewardsConfig: RewardSlice[];
}

interface ReviewRequestData {
  id: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  googleReviewUrl: string;
  gateReviews: boolean;
  reviewThreshold: number;
  status: string;
  rating?: number;
  staffMember?: { name: string; role: string } | null;
  v2: V2Settings;
}

export default function PublicReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewRequestData | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [step, setStep] = useState<'welcome' | 'rating' | 'positive' | 'negative' | 'completed' | 'spin'>('welcome');
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<ReviewTag[]>([]);
  const [aiText, setAiText] = useState('');
  const [copied, setCopied] = useState(false);
  const [recoveryAction, setRecoveryAction] = useState<string | null>(null);
  const [spinReward, setSpinReward] = useState<{ label: string; emoji: string; discountCode: string; discountPercent?: number; color: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [loyaltyData, setLoyaltyData] = useState<{ total_visits: number; stamps_count: number } | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/public/reputation/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Review request not found or expired.');
        return res.json();
      })
      .then((payload) => {
        setData(payload.data);
        if (payload.data.rating) {
          setRating(payload.data.rating);
          setStep('completed');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load feedback page.');
        setLoading(false);
      });
  }, [id]);

  const triggerConfetti = useCallback(() => {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2000);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          const res = await fetch('/api/public/reputation/voice', {
            method: 'POST',
            body: formData,
          });
          const payload = await res.json();
          setTranscript(payload.data?.text || '');
        } catch {
          setTranscript('[Transcription failed]');
        } finally {
          setTranscribing(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    if (selectedRating === 5) triggerConfetti();
    const threshold = data?.reviewThreshold ?? 4;
    const gate = data?.gateReviews ?? true;

    if (gate) {
      setStep(selectedRating >= threshold ? 'positive' : 'negative');
    } else {
      setStep('positive');
    }
  };

  const toggleTag = (tag: ReviewTag) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      setAiText(composeReviewText(next, transcript || undefined));
      return next;
    });
  };

  const handleAiGenerate = async () => {
    if (selectedTags.length === 0) return;
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/public/reputation/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags, voiceTranscript: transcript || undefined }),
      });
      const payload = await res.json();
      if (payload.data?.text) {
        setAiText(payload.data.text);
      }
    } catch {
      setAiText(composeReviewText(selectedTags, transcript || undefined));
    } finally {
      setSubmitLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoogleReviewClick = async () => {
    if (!id || !data?.googleReviewUrl) return;
    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/public/reputation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'click_google',
          rating: rating || 5,
          tagsSelected: selectedTags,
          aiGeneratedText: aiText || undefined,
          voiceTranscript: transcript || undefined,
          sentimentScore: rating ? (rating - 3) / 2 : 0.5,
          rewardsConfig: data.v2.rewardsConfig,
        }),
      });

      const payload = await res.json();
      if (payload.reward) {
        setSpinReward(payload.reward);
        setStep('spin');
      } else {
        window.location.href = data.googleReviewUrl;
      }
    } catch {
      window.location.href = data.googleReviewUrl;
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSpinWheel = () => {
    if (isSpinning || !spinReward) return;
    setIsSpinning(true);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetAngle = 360 * extraSpins + Math.random() * 360;
    const startAngle = spinAngle;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + targetAngle * easeOut;
      setSpinAngle(currentAngle);

      if (progress < 1) {
        spinAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
      }
    };

    spinAnimationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (spinAnimationRef.current) cancelAnimationFrame(spinAnimationRef.current);
    };
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || rating === null) return;
    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/public/reputation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          rating,
          feedback,
          tagsSelected: selectedTags,
          recoveryActionRequested: recoveryAction,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback.');
      setStep('completed');
    } catch {
      alert('Something went wrong. Please try submitting again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSkipWelcome = () => setStep('rating');

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading feedback page...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg backdrop-blur-md">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Link Expired or Invalid</h2>
          <p className="text-sm text-muted-foreground">
            This review request link is either invalid, has expired, or has already been used.
          </p>
        </div>
      </div>
    );
  }

  const bc = data.v2.brandingColor || '#f59e0b';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-[120px]" style={{ backgroundColor: `${bc}15` }} />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Confetti overlay */}
        {confetti.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {confetti.map((c) => (
              <div
                key={c.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  backgroundColor: c.color,
                  animation: `fall 2s ease-out ${c.delay}s forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 text-center space-y-5">
              {data.v2.logoUrl && (
                <img
                  src={data.v2.logoUrl}
                  alt={data.businessName}
                  className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg"
                />
              )}
              {data.v2.ownerPhotoUrl && (
                <div className="flex justify-center -mt-2">
                  <div className="relative">
                    <img
                      src={data.v2.ownerPhotoUrl}
                      alt={data.v2.ownerName || 'Owner'}
                      className="h-16 w-16 rounded-full object-cover border-4 border-card ring-2"
                      style={{ borderColor: bc }}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {data.v2.ownerName ? `Hi! I'm ${data.v2.ownerName}` : `Welcome to ${data.businessName}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {data.v2.welcomeMessage || `${data.contactName}, thank you for visiting ${data.businessName}! We'd love to hear about your experience.`}
                </p>
              </div>
              {data.staffMember && (
                <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Serviced by <strong>{data.staffMember.name}</strong> ({data.staffMember.role})</span>
                </div>
              )}
              <Button
                onClick={handleSkipWelcome}
                className="w-full font-semibold text-white shadow-lg transition-all active:scale-98"
                style={{ backgroundColor: bc }}
                size="lg"
              >
                Share Your Feedback
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* RATING SCREEN */}
        {step === 'rating' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="border-b border-border bg-muted/20 px-6 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: bc }}>
                Customer Experience Survey
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground truncate">
                {data.businessName}
              </h2>
            </div>
            <div className="p-6 space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Hi {data.contactName}!
                </h3>
                <p className="text-sm text-muted-foreground">
                  How was your experience? Tap an emoji to begin.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 py-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isSelected = hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating;
                  const emojiData = RATING_EMOJIS[star];
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="group relative transition-all duration-200 hover:scale-125 active:scale-95 outline-none"
                    >
                      <span
                        className={`block text-3xl sm:text-4xl transition-all duration-200 ${
                          isSelected
                            ? 'scale-110 drop-shadow-lg'
                            : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-80'
                        }`}
                      >
                        {emojiData.emoji}
                      </span>
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {emojiData.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Your feedback is highly valuable to us and is securely logged.
              </p>
            </div>
          </div>
        )}

        {/* POSITIVE REVIEW SCREEN */}
        {step === 'positive' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${bc}20` }}>
                  <Sparkles className="h-8 w-8" style={{ color: bc }} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Awesome! Thank you!
                </h3>
                <p className="text-sm text-muted-foreground">
                  We are thrilled you had a great experience! Help others find us by leaving a Google review.
                </p>
              </div>

              {/* AI Review Assistant - Tags */}
              {data.v2.enableAiChips && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    What did you enjoy? Tap to build your review:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {REVIEW_TAGS.map(({ key, emoji }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleTag(key)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedTags.includes(key)
                            ? 'border-transparent text-white shadow-sm'
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                        }`}
                        style={
                          selectedTags.includes(key)
                            ? { backgroundColor: bc, borderColor: bc }
                            : {}
                        }
                      >
                        {emoji} {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Generated Review Text */}
              {(selectedTags.length > 0 || transcript) && (
                <div className="space-y-2">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-left">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" style={{ color: bc }} />
                      AI-Generated Review
                    </p>
                    <p className="text-sm text-foreground italic">
                      {aiText || composeReviewText(selectedTags, transcript || undefined)}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => copyToClipboard(aiText || composeReviewText(selectedTags, transcript || undefined))}
                      className="text-xs"
                    >
                      {copied ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Copied</>
                      ) : (
                        <><Copy className="mr-1 h-3 w-3" /> Copy</>
                      )}
                    </Button>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={handleAiGenerate}
                        disabled={submitLoading}
                        className="text-xs"
                      >
                        {submitLoading ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <><Sparkles className="mr-1 h-3 w-3" /> Polish with AI</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Voice Review */}
              {data.v2.enableVoiceReview && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Or record a voice review:
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant={isRecording ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className="flex items-center gap-2"
                    >
                      {isRecording ? (
                        <><MicOff className="h-4 w-4" /> Stop Recording</>
                      ) : (
                        <><Mic className="h-4 w-4" /> Record Voice</>
                      )}
                    </Button>
                    {transcribing && (
                      <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Transcribing...
                      </span>
                    )}
                  </div>
                  {transcript && (
                    <p className="text-xs text-muted-foreground italic bg-muted/20 rounded-lg p-2">
                      "{transcript}"
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleGoogleReviewClick}
                  disabled={submitLoading}
                  className="w-full font-semibold text-white shadow-lg transition-all hover:brightness-105 active:scale-98"
                  style={{ backgroundColor: bc, boxShadow: `0 4px 14px ${bc}40` }}
                  size="lg"
                >
                  {submitLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Write Review on Google
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('rating')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change my rating
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEGATIVE / RECOVERY FLOW */}
        {step === 'negative' && (
          <form onSubmit={handleFeedbackSubmit} className="animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 space-y-5">
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  We're sorry 😔
                </h3>
                <p className="text-sm text-muted-foreground">
                  We apologize that your experience didn't meet expectations. Your feedback helps us improve.
                </p>
              </div>

              {/* Apology + Recovery actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  How can we make it right?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'manager_call', label: 'Request Manager Call', emoji: '📞' },
                    { value: 'refund', label: 'Request Refund', emoji: '💰' },
                    { value: 'replace', label: 'Get Replacement', emoji: '🔄' },
                    { value: 'coupon', label: 'Get Discount Coupon', emoji: '🎫' },
                  ].map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => setRecoveryAction(recoveryAction === action.value ? null : action.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all ${
                        recoveryAction === action.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-foreground/30'
                      }`}
                    >
                      <span className="text-lg">{action.emoji}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags for low rating */}
              {data.v2.enableAiChips && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    What went wrong? (Optional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REVIEW_TAGS.map(({ key, emoji }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleTag(key)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                          selectedTags.includes(key)
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                            : 'border-border text-muted-foreground hover:border-foreground/30'
                        }`}
                      >
                        {emoji} {key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what went wrong or how we can improve..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  disabled={submitLoading || (!feedback.trim() && !recoveryAction)}
                  className="w-full font-semibold text-white transition-all active:scale-98"
                  style={{ backgroundColor: bc }}
                  size="lg"
                >
                  {submitLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Submit Private Feedback'
                  )}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('rating')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change my rating
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* SPIN THE WHEEL */}
        {step === 'spin' && spinReward && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Gift className="h-7 w-7" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  You Won!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Thanks for your review! Spin the wheel to reveal your reward.
                </p>
              </div>

              {/* SVG Spin Wheel */}
              <div className="relative mx-auto h-56 w-56">
                <canvas
                  ref={canvasRef}
                  width={224}
                  height={224}
                  className="hidden"
                />
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  {data.v2.rewardsConfig.map((slice, i) => {
                    const totalProb = data.v2.rewardsConfig.reduce((s, r) => s + r.probability, 0);
                    const sliceAngle = (slice.probability / totalProb) * 360;
                    const offset = data.v2.rewardsConfig
                      .slice(0, i)
                      .reduce((s, r) => s + (r.probability / totalProb) * 360, 0);
                    const midAngle = offset + sliceAngle / 2;
                    const rad = (midAngle * Math.PI) / 180;
                    const r = 80;
                    const cx = 100, cy = 100;
                    const x1 = cx + r * Math.cos((offset * Math.PI) / 180);
                    const y1 = cy + r * Math.sin((offset * Math.PI) / 180);
                    const x2 = cx + r * Math.cos(((offset + sliceAngle) * Math.PI) / 180);
                    const y2 = cy + r * Math.sin(((offset + sliceAngle) * Math.PI) / 180);
                    const largeArc = sliceAngle > 180 ? 1 : 0;

                    return (
                      <g key={i} style={{ transform: `rotate(${spinAngle}deg)`, transformOrigin: '100px 100px' }}>
                        <path
                          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={slice.color}
                          stroke="white"
                          strokeWidth="1"
                        />
                        <text
                          x={cx + 55 * Math.cos(rad)}
                          y={cy + 55 * Math.sin(rad)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {slice.emoji}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center circle */}
                  <circle cx="100" cy="100" r="18" fill="white" stroke="#ddd" strokeWidth="2" />
                  {/* Pointer */}
                  <polygon points="100,5 94,20 106,20" fill="#333" />
                </svg>
              </div>

              <Button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full font-semibold text-white shadow-lg transition-all active:scale-98"
                style={{ backgroundColor: bc }}
                size="lg"
              >
                {isSpinning ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Spinning...</>
                ) : (
                  <>{spinReward.emoji} Spin the Wheel!</>
                )}
              </Button>

              {!isSpinning && spinAngle > 0 && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="rounded-xl border-2 p-4" style={{ borderColor: spinReward.color }}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Your Reward</p>
                    <p className="text-lg font-bold">{spinReward.emoji} {spinReward.label}</p>
                    {spinReward.discountCode && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                        <code className="text-sm font-bold tracking-wider">{spinReward.discountCode}</code>
                        <button
                          onClick={() => copyToClipboard(spinReward.discountCode!)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    {spinReward.discountPercent && spinReward.discountPercent > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">{spinReward.discountPercent}% OFF your next visit!</p>
                    )}
                  </div>

                  <Button
                    onClick={async () => {
                      try {
                        await fetch(`/api/public/reputation/${id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'click_google', rating: rating || 5 }),
                        });
                      } catch {}
                      if (data.googleReviewUrl) window.location.href = data.googleReviewUrl;
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Continue to Google Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPLETED SCREEN */}
        {step === 'completed' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Thank You!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your feedback has been successfully submitted to {data.businessName}. We appreciate you taking the time to help us grow.
                </p>
              </div>

              {/* Loyalty Card */}
              <div className="rounded-xl border border-border bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-bold text-foreground">Your Loyalty Card</span>
                </div>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
                        s <= (loyaltyData?.stamps_count || 1)
                          ? 'border-amber-400 bg-amber-400 text-white shadow-sm'
                          : 'border-muted-foreground/20 text-muted-foreground/30'
                      }`}
                    >
                      {s <= (loyaltyData?.stamps_count || 1) ? '⭐' : s}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {(loyaltyData?.stamps_count || 1)} / 5 visits completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Branding */}
        <div className="border-t border-border/50 bg-muted/10 px-6 py-3">
          <div className="flex items-center justify-center gap-2">
            <Camera className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground text-center">
              Powered by <span className="font-semibold">{data.businessName}</span> Experience Platform
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
