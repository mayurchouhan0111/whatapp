'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Star, ExternalLink, QrCode, Printer, AlertCircle, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ReputationSettingsData {
  google_review_url: string;
  gate_reviews: boolean;
  review_threshold: number;
  sms_template: string;
}

export function ReputationSettings() {
  const { accountId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ReputationSettingsData | null>(null);

  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [gateReviews, setGateReviews] = useState(true);
  const [reviewThreshold, setReviewThreshold] = useState(4);
  const [smsTemplate, setSmsTemplate] = useState('');

  const [qrLink, setQrLink] = useState('');

  useEffect(() => {
    loadSettings();
    const host = window.location.host;
    const protocol = window.location.protocol;
    setQrLink(`${protocol}//${host}/r/qr/${accountId}`);
  }, [accountId]);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/reputation/settings');
      if (res.ok) {
        const payload = await res.json();
        const config = payload.data;
        if (config) {
          setSettings(config);
          setGoogleReviewUrl(config.google_review_url || '');
          setGateReviews(config.gate_reviews !== false);
          setReviewThreshold(config.review_threshold ?? 4);
          setSmsTemplate(config.sms_template || '');
        }
      }
    } catch (err) {
      console.error('[reputation-settings] load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!googleReviewUrl.trim()) {
      toast.error('Google Review URL is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/reputation/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_review_url: googleReviewUrl.trim(),
          gate_reviews: gateReviews,
          review_threshold: reviewThreshold,
          sms_template: smsTemplate.trim() || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to save settings');
      toast.success('Reputation settings saved.');
      setSettings(payload.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Print Review QR</title>
      <style>
        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; text-align: center; padding: 20px; }
        .card { border: 3px solid #111; border-radius: 24px; padding: 50px 40px; max-width: 480px; }
        h1 { font-size: 32px; margin-bottom: 5px; }
        h2 { font-size: 20px; font-weight: 500; color: #444; margin-bottom: 40px; }
        .qr { background: #fff; border: 1px solid #ddd; padding: 25px; border-radius: 16px; display: inline-block; margin-bottom: 40px; }
        .instruction { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .subtext { font-size: 14px; color: #666; }
      </style></head>
      <body><div class="card">
        <h1>We Value Your Feedback!</h1>
        <h2>Help us serve you better</h2>
        <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrLink)}" alt="QR" /></div>
        <div class="instruction">Scan the QR Code</div>
        <div class="subtext">Use your smartphone to register and rate your experience.</div>
      </div><script>window.onload=function(){window.print()}</script></body></html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!settings?.google_review_url && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-start gap-4 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-600">Google Review URL not configured</h4>
              <p className="text-xs text-muted-foreground">
                Set up your Google Business Profile link below to start collecting reviews.
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Google Review Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Configure your Google Business Profile link and review gating rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Google Review Link</label>
                <Input
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Find this in your Google Business Profile manager under &ldquo;Share review form&rdquo;.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Review Gating Threshold</label>
                  <select
                    value={reviewThreshold}
                    onChange={(e) => setReviewThreshold(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value={5}>Only 5-star reviews</option>
                    <option value={4}>4 stars or higher</option>
                    <option value={3}>3 stars or higher</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Ratings below this threshold go to private feedback instead of Google.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5 pr-2">
                    <label className="text-xs font-semibold text-foreground">Gate Negative Reviews</label>
                    <p className="text-[10px] text-muted-foreground">Route low ratings to private feedback.</p>
                  </div>
                  <Switch checked={gateReviews} onCheckedChange={setGateReviews} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">WhatsApp Invitation Template</label>
                <textarea
                  value={smsTemplate}
                  onChange={(e) => setSmsTemplate(e.target.value)}
                  rows={4}
                  placeholder="Hi {{contact_name}}, thank you for choosing {{business_name}}! ..."
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  <span>Variables:</span>
                  <span className="font-semibold select-all bg-muted px-1 rounded">{'{{contact_name}}'}</span>
                  <span className="font-semibold select-all bg-muted px-1 rounded">{'{{business_name}}'}</span>
                  <span className="font-semibold select-all bg-muted px-1 rounded">{'{{review_link}}'}</span>
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full font-semibold">
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-semibold">Checkout QR Code</CardTitle>
            <CardDescription className="text-xs">
              Print this poster for your reception desk.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 flex-1">
            <div className="bg-white border border-border p-4 rounded-xl shadow-inner">
              {qrLink ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}`}
                  alt="Checkout QR"
                  className="h-[180px] w-[180px] object-contain"
                />
              ) : (
                <div className="h-[180px] w-[180px] bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground">
                  Generating...
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-[10px] break-all select-all font-mono">
                {qrLink || 'generating...'}
              </Badge>
            </div>
          </CardContent>
          <div className="p-6 border-t bg-muted/10">
            <Button onClick={handlePrintQR} variant="outline" className="w-full flex items-center justify-center gap-2">
              <Printer className="h-4 w-4" />
              Print QR Poster
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
