'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Loader2, QrCode, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QRDeskPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [businessName, setBusinessName] = useState('Our Business');
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!accountId) return;

    fetch(`/api/public/reputation/qr?accountId=${accountId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Business account not found.');
        }
        return res.json();
      })
      .then((payload) => {
        setBusinessName(payload.data.name);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load business details.');
        setLoading(false);
      });
  }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || submitLoading) return;
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/public/reputation/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          accountId,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to check in.');
      }

      // Redirect to the newly generated feedback request link
      router.push(`/r/${payload.reviewRequestId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong. Please check your inputs.');
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading check-in page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg backdrop-blur-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Invalid QR Link</h2>
          <p className="text-sm text-muted-foreground">
            The QR link scanned is invalid or the business account configuration is missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-radial from-background/40 to-muted/20 px-4 py-12">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl backdrop-blur-xl transition-all duration-300">
        
        {/* Header Banner */}
        <div className="border-b border-border bg-muted/20 px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <QrCode className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground truncate" title={businessName}>
            {businessName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome! Please enter your details to share your feedback.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name-input" className="text-xs font-semibold text-muted-foreground">
                Your Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="phone-input" className="text-xs font-semibold text-muted-foreground">
                WhatsApp Phone Number (E.164 format)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/60">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/80 pl-1 leading-normal">
                Include country code (e.g. +1 for US, +91 for India).
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitLoading || !name.trim() || !phone.trim()}
              className="mt-2 w-full bg-primary font-semibold text-primary-foreground transition-all active:scale-98"
              size="lg"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking in...
                </>
              ) : (
                'Check in & Rate Us'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
