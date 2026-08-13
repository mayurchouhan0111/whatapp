'use client';

import { useMemo, useState } from 'react';
import {
  BrainCircuit,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Star,
  Timer,
  Bot,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { BrandVoiceTone } from '@/types/reputation';

type ToneOption = { value: BrandVoiceTone; label: string; description: string };

const TONE_OPTIONS: ToneOption[] = [
  { value: 'warm', label: 'Warm', description: 'Friendly and grateful' },
  { value: 'professional', label: 'Professional', description: 'Polished, no jargon' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, like a neighbor' },
  { value: 'empathetic', label: 'Empathetic', description: 'Hearty and understanding' },
];

interface AiReplyResult {
  reply: string;
  confidence_score: number;
  model_used: string;
  response_time_ms: number;
  humanized: boolean;
}

const MODEL_LABELS: Record<string, string> = {
  'openai-gpt-4o-mini': 'GPT-4o Mini',
  'gemini-2.0-flash': 'Gemini Flash',
  fallback: 'Offline fallback',
};

function humanLikenessLabel(score: number): { label: string; className: string } {
  if (score >= 0.9) return { label: 'Very human', className: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 0.7) return { label: 'Mostly human', className: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Could be more natural', className: 'text-rose-600 dark:text-rose-400' };
}

export default function AiReplyGenerator() {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [tone, setTone] = useState<BrandVoiceTone>('warm');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiReplyResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [copied, setCopied] = useState(false);

  const presetExamples = useMemo(
    () => [
      'Great service, the staff were so friendly and fast!',
      'Food was good but we waited 40 minutes for our order.',
      'Best biryani in town. Highly recommend the chicken special.',
    ],
    [],
  );

  const canGenerate = reviewText.trim().length > 2;

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setResult(null);
    setEditing(false);
    try {
      const res = await fetch('/api/reputation/ai-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: reviewText.trim(),
          rating,
          brandVoice: { tone },
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Generation failed');
      const data = payload.data as AiReplyResult;
      setResult(data);
      setEditableText(data.reply);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate a reply.');
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(text: string) {
    setReviewText(text);
    if (result) {
      setResult(null);
      setEditing(false);
    }
  }

  async function copyReply() {
    const text = editing ? editableText : result?.reply;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Reply copied to clipboard.');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error('Could not copy to clipboard.');
    }
  }

  const likeness = result
    ? humanLikenessLabel(result.confidence_score)
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Left: input */}
      <Card className="lg:col-span-3 h-fit border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  AI Reply Generator
                </CardTitle>
              </div>
              <CardDescription className="mt-2 text-xs">
                Write a review the way a real owner would. No form letters. No robots.
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 border-primary/25 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" /> Human-like
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {result === null && (
            <div className="flex flex-wrap gap-1.5">
              {presetExamples.map((ex, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => applyPreset(ex)}
                  className="text-[11px] text-muted-foreground font-normal hover:text-foreground hover:border-primary/40 h-7"
                >
                  {ex.split(',')[0]}…
                </Button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Customer review</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Paste a review your customer left…"
              className="min-h-[112px] resize-none bg-background"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {reviewText.length} characters
              </span>
              <span className="text-[11px] text-muted-foreground">
                {canGenerate ? 'Ready to generate' : 'Enter a review to begin'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Star rating given</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="rounded-md p-1.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${s} star${s > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      s <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">
                {rating <= 2 ? 'Negative' : rating === 3 ? 'Neutral' : 'Positive'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Brand tone</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={`rounded-lg border px-2 py-2 text-left transition-colors ${
                    tone === opt.value
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border bg-background hover:border-primary/30'
                  }`}
                >
                  <div className="text-xs font-semibold text-foreground">{opt.label}</div>
                  <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={generate}
            disabled={loading || !canGenerate}
            className="w-full gap-2 font-bold shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking like a human…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" /> Generate human reply
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Right: output */}
      <div className="lg:col-span-2 space-y-4">
        {loading && (
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Drafting your reply…
              </div>
              <div className="space-y-2">
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !result && (
          <Card>
            <CardContent className="flex h-full min-h-[340px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
                <Bot className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-foreground">Your reply appears here</p>
              <p className="max-w-[260px] text-xs text-muted-foreground">
                The generator writes a reply in your brand tone, then scrubs it for robotic
                phrasing — so it reads as genuinely written by your team.
              </p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Generated reply</CardTitle>
                </div>
                {likeness && (
                  <span className={`text-[11px] font-semibold ${likeness.className}`}>
                    {likeness.label} {Math.round(result.confidence_score * 100)}%
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Bot className="h-3 w-3" />
                  {MODEL_LABELS[result.model_used] ?? result.model_used}
                </Badge>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Timer className="h-3 w-3" />
                  {result.response_time_ms}ms
                </Badge>
                {result.humanized && (
                  <Badge variant="outline" className="gap-1 border-primary/25 bg-primary/5 text-primary text-[10px]">
                    <Wand2 className="h-3 w-3" /> Humanized
                  </Badge>
                )}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.max(8, result.confidence_score * 100)}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editing ? (
                <Textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="min-h-[140px] resize-none bg-background"
                />
              ) : (
                <p className="whitespace-pre-wrap rounded-xl border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
                  {editableText}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="xs"
                  variant={editing ? 'default' : 'outline'}
                  onClick={() => {
                    if (editing) {
                      setResult({ ...result, reply: editableText });
                      toast.success('Reply updated.');
                    }
                    setEditing(!editing);
                  }}
                  className="gap-1.5"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {editing ? 'Save edit' : 'Edit reply'}
                </Button>
                <Button type="button" size="xs" variant="outline" onClick={copyReply} className="gap-1.5">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={generate}
                  disabled={loading}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Another variation
                </Button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent((editing ? editableText : result.reply).trim())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}