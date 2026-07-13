'use client';

import { use, useEffect, useState } from 'react';
import { Star, MessageSquare, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewRequestData {
  id: string;
  businessName: string;
  contactName: string;
  googleReviewUrl: string;
  gateReviews: boolean;
  reviewThreshold: number;
  status: string;
  rating?: number;
}

export default function PublicReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewRequestData | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'rating' | 'positive' | 'negative' | 'completed'>('rating');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/public/reputation/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Review request not found or expired.');
        }
        return res.json();
      })
      .then((payload) => {
        setData(payload.data);
        if (payload.data.rating) {
          setRating(payload.data.rating);
          // If already rated, skip to completed
          setStep('completed');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load feedback page.');
        setLoading(false);
      });
  }, [id]);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    const threshold = data?.reviewThreshold ?? 4;
    const gate = data?.gateReviews ?? true;

    if (gate) {
      if (selectedRating >= threshold) {
        setStep('positive');
      } else {
        setStep('negative');
      }
    } else {
      // If gating is disabled, always send to positive/Google review stage
      setStep('positive');
    }
  };

  const handleGoogleReviewClick = async () => {
    if (!id || !data?.googleReviewUrl) return;
    setSubmitLoading(true);

    try {
      await fetch(`/api/public/reputation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'click_google',
          rating: rating || 5,
        }),
      });

      // Redirect to Google review page
      window.location.href = data.googleReviewUrl;
    } catch (err) {
      console.error('Failed to log review click:', err);
      // Still redirect anyway to avoid blocking the user
      window.location.href = data.googleReviewUrl;
    } finally {
      setSubmitLoading(false);
    }
  };

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
        }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback.');
      setStep('completed');
    } catch (err) {
      console.error('Feedback submit failed:', err);
      alert('Something went wrong. Please try submitting again.');
    } finally {
      setSubmitLoading(false);
    }
  };

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
            This review request link is either invalid, has expired, or has already been used. Please reach out to the business if you have any questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-radial from-background/40 to-muted/20 px-4 py-12">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl backdrop-blur-xl transition-all duration-300">
        
        {/* Card Header */}
        <div className="border-b border-border bg-muted/20 px-6 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Customer Experience Survey</p>
          <h2 className="mt-1 text-lg font-bold text-foreground truncate" title={data.businessName}>
            {data.businessName}
          </h2>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {step === 'rating' && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Hi {data.contactName}!
                </h3>
                <p className="text-sm text-muted-foreground">
                  How would you rate your recent experience with us? Tap a star to begin.
                </p>
              </div>

              {/* Star Interface */}
              <div className="flex items-center justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = (hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="group relative transition-transform duration-100 active:scale-95 outline-none"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors duration-200 ${
                          isGold
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-muted-foreground/40 hover:text-muted-foreground/70'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Your feedback is highly valuable to us and is securely logged.
              </p>
            </div>
          )}

          {step === 'positive' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 text-amber-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Awesome! Thank you!
                </h3>
                <p className="text-sm text-muted-foreground">
                  We are thrilled that you had a great experience. Could you take 10 seconds to share your review on Google? It helps others find us!
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleGoogleReviewClick}
                  disabled={submitLoading}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-98"
                  size="lg"
                >
                  {submitLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Write Review on Google'
                  )}
                  <ChevronRight className="ml-2 h-4 w-4" />
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
          )}

          {step === 'negative' && (
            <form onSubmit={handleFeedbackSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  We value your feedback
                </h3>
                <p className="text-sm text-muted-foreground">
                  We are sorry your experience didn't meet expectations. Please let us know how we can improve.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what went wrong or how we can improve..."
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  disabled={submitLoading || !feedback.trim()}
                  className="w-full bg-primary font-semibold text-primary-foreground transition-all active:scale-98"
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
            </form>
          )}

          {step === 'completed' && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-center animate-bounce">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Thank You!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your feedback has been successfully submitted to {data.businessName}. We appreciate you taking the time to help us grow and improve our services.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
