'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Phone, Loader2, QrCode, AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function QRContent({ accountId }: { accountId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [businessName, setBusinessName] = useState('Our Business');
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const staff = searchParams.get('staff');
  const table = searchParams.get('table');

  useEffect(() => {
    if (!accountId) return;

    fetch(`/api/public/reputation/qr?accountId=${accountId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Business account not found.');
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
          staffId: staff || undefined,
          tableNumber: table || undefined,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to check in.');

      router.push(`/r/${payload.reviewRequestId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong.');
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-12">
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
          {(staff || table) && (
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              {staff && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                  <User className="h-3 w-3" /> Staff: {staff}
                </span>
              )}
              {table && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                  <Zap className="h-3 w-3" /> Table: {table}
                </span>
              )}
            </div>
          )}
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
                WhatsApp Phone Number
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

            {/* 1-Tap Quick Submit - if staff/table are present, offer an express option */}
            {(staff || table) && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      Quick Check-in Available
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Your table and staff info are pre-linked. Just enter your details and you&rsquo;re set!
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                <>
                  Check in & Rate Us
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function QRDeskPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      }
    >
      <QRContent accountId={accountId} />
    </Suspense>
  );
}
