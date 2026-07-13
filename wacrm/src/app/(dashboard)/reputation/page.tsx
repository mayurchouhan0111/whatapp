'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Star, 
  Send, 
  Eye, 
  MousePointerClick, 
  MessageSquare, 
  QrCode, 
  Printer, 
  Settings2, 
  Search, 
  RotateCcw, 
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ReviewRequest {
  id: string;
  account_id: string;
  contact_id: string;
  status: 'sent' | 'opened' | 'rated' | 'clicked' | 'failed';
  rating: number | null;
  feedback: string | null;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
  contact?: Contact;
}

interface ReputationSettings {
  google_review_url: string;
  gate_reviews: boolean;
  review_threshold: number;
  sms_template: string;
}

export default function ReputationDashboardPage() {
  const { accountId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [settings, setSettings] = useState<ReputationSettings | null>(null);

  // Settings form states
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [gateReviews, setGateReviews] = useState(true);
  const [reviewThreshold, setReviewThreshold] = useState(4);
  const [smsTemplate, setSmsTemplate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');

  // Host info for QR Code
  const [qrLink, setQrLink] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, setRes] = await Promise.all([
        fetch('/api/reputation/requests'),
        fetch('/api/reputation/settings'),
      ]);

      if (reqRes.ok) {
        const payload = await reqRes.json();
        setRequests(payload.data || []);
      }

      if (setRes.ok) {
        const payload = await setRes.json();
        const config = payload.data;
        if (config) {
          setSettings(config);
          setGoogleReviewUrl(config.google_review_url || '');
          setGateReviews(config.gate_reviews !== false);
          setReviewThreshold(config.review_threshold ?? 4);
          setSmsTemplate(config.sms_template || '');
        }
      }
    } catch (error) {
      console.error('[reputation] Failed to load data:', error);
      toast.error('Failed to load reputation logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Set QR code link matching the deployment URL
    const host = window.location.host;
    const protocol = window.location.protocol;
    setQrLink(`${protocol}//${host}/r/qr/${accountId}`);
  }, [loadData, accountId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleReviewUrl.trim()) {
      toast.error('Google Review URL is required.');
      return;
    }
    setSavingSettings(true);

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

      toast.success('Reputation settings saved successfully.');
      setSettings(payload.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResend = async (contactId: string) => {
    try {
      toast.loading('Queueing review request...', { id: 'resend' });
      const res = await fetch('/api/reputation/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contactId }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to resend request');

      toast.success('Review request queued and sent via WhatsApp!', { id: 'resend' });
      loadData(); // Reload logs
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resend request failed.', { id: 'resend' });
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Counter Review Poster</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              text-align: center;
              padding: 20px;
            }
            .poster-card {
              border: 3px solid #111;
              border-radius: 24px;
              padding: 50px 40px;
              max-width: 480px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            }
            h1 {
              font-size: 32px;
              margin-bottom: 5px;
              color: #111;
            }
            h2 {
              font-size: 20px;
              font-weight: 500;
              color: #444;
              margin-bottom: 40px;
            }
            .qr-container {
              background: #fff;
              border: 1px solid #ddd;
              padding: 25px;
              border-radius: 16px;
              display: inline-block;
              margin-bottom: 40px;
            }
            .instruction {
              font-size: 18px;
              font-weight: bold;
              color: #111;
              margin-bottom: 10px;
            }
            .subtext {
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="poster-card">
            <h1>We Value Your Feedback!</h1>
            <h2>Help us serve you better</h2>
            
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrLink)}" alt="Scan to Rate Us" />
            </div>
            
            <div class="instruction">Scan the QR Code</div>
            <div class="subtext">Use your smartphone camera to quickly register and rate your experience with us.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              // window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Metrics Calculations
  const totalSent = requests.length;
  const openedRequests = requests.filter(r => ['opened', 'rated', 'clicked'].includes(r.status));
  const openRate = totalSent > 0 ? (openedRequests.length / totalSent) * 100 : 0;

  const clickedRequests = requests.filter(r => r.status === 'clicked');
  const clickThroughRate = totalSent > 0 ? (clickedRequests.length / totalSent) * 100 : 0;

  const ratedRequests = requests.filter(r => r.rating !== null && r.rating > 0);
  const averageRating = ratedRequests.length > 0 
    ? ratedRequests.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRequests.length
    : 0;

  // Rating count distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // 1-star to 5-star
  ratedRequests.forEach(r => {
    if (r.rating && r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++;
    }
  });
  const maxCount = Math.max(...ratingCounts, 1);

  // Private Negative Feedbacks
  const privateFeedbacks = requests.filter(
    r => r.rating !== null && r.rating < (settings?.review_threshold ?? 4) && r.feedback
  );

  // Search Filtered History
  const filteredRequests = requests.filter((r) => {
    const contactName = r.contact?.name || '';
    const contactPhone = r.contact?.phone || '';
    const query = searchTerm.toLowerCase();
    return contactName.toLowerCase().includes(query) || contactPhone.includes(query);
  });

  const getStatusBadge = (status: ReviewRequest['status']) => {
    const config = {
      sent: { text: 'Sent', className: 'bg-blue-500/10 text-blue-500 border-blue-500/25' },
      opened: { text: 'Opened', className: 'bg-amber-500/10 text-amber-500 border-amber-500/25' },
      clicked: { text: 'Clicked (Google)', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' },
      rated: { text: 'Private Review', className: 'bg-green-500/10 text-green-500 border-green-500/25' },
      failed: { text: 'Failed', className: 'bg-rose-500/10 text-rose-500 border-rose-500/25' },
    };

    const c = config[status] || { text: status, className: '' };
    return (
      <Badge variant="outline" className={`font-semibold ${c.className}`}>
        {c.text}
      </Badge>
    );
  };

  const renderStars = (num: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-3 w-3 ${
              s <= num ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading reputation panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reputation & Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Collect Google reviews via WhatsApp, monitor customer experience, and mitigate negative reviews.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="flex items-center gap-2 self-start sm:self-center">
          <RotateCcw className="h-4 w-4" />
          Reload
        </Button>
      </div>

      {!settings?.google_review_url && (
        <Card className="border-amber-500/30 bg-amber-500/5 text-amber-500/90 dark:border-amber-500/20">
          <CardHeader className="flex flex-row items-start gap-4 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold">Google Review link is not configured</h4>
              <p className="text-xs text-muted-foreground">
                Go to the <strong>Settings</strong> tab below to input your Google Business Profile URL so review requests can redirect customers correctly.
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/40 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <Send className="h-4 w-4" />
            Request History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Total Requests Sent</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{totalSent}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Review prompts initiated</p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Open Rate</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{openRate.toFixed(1)}%</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{openedRequests.length} link opens</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Google Review Clicks</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{clickThroughRate.toFixed(1)}%</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{clickedRequests.length} clicked Google button</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Average Rating</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : '—'}</div>
                  {averageRating > 0 && (
                    <div className="flex fill-amber-400 text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Based on {ratedRequests.length} feedbacks</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Rating Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Rating Distribution</CardTitle>
                <CardDescription className="text-xs">Spread of internal survey star counts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars - 1];
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-medium flex items-center gap-1">
                        {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 bg-muted/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground font-semibold">{count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Negative Feedback Stream */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Private Feedback Feed</CardTitle>
                <CardDescription className="text-xs">
                  Reviews falling below threshold ({settings?.review_threshold ?? 4} stars) kept private
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {privateFeedbacks.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground">No gated private feedback received.</p>
                    </div>
                  ) : (
                    privateFeedbacks.map((fb) => (
                      <div key={fb.id} className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{fb.contact?.name || 'Anonymous Customer'}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(new Date(fb.created_at), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          {renderStars(fb.rating || 0)}
                          <Badge variant="secondary" className="text-[10px]">{fb.contact?.phone}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap italic mt-1 bg-background/50 rounded-lg p-2 border border-border/30">
                          "{fb.feedback}"
                        </p>
                        <div className="flex justify-end pt-1">
                          <a
                            href={`/inbox?contactId=${fb.contact_id}`}
                            className={buttonVariants({
                              variant: 'link',
                              size: 'xs',
                              className: 'text-xs text-primary px-0 flex items-center gap-1.5',
                            })}
                          >
                            Open Inbox Conversation
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="outline-none">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Review Logs</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  History of all generated review campaigns and requests.
                </CardDescription>
              </div>
              {/* Search */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search customer name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stars</TableHead>
                      <TableHead>Private Feedback</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-sm">
                          No review requests matching query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            <div className="text-sm">{req.contact?.name || 'Customer'}</div>
                            <div className="text-xs text-muted-foreground">{req.contact?.phone}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(req.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                          <TableCell>
                            {req.rating ? renderStars(req.rating) : <span className="text-xs text-muted-foreground/50">—</span>}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs" title={req.feedback || ''}>
                            {req.feedback || <span className="text-muted-foreground/45">No feedback</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleResend(req.contact_id)}
                              variant="outline"
                              size="xs"
                              className="text-xs flex items-center gap-1.5 ml-auto"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Resend
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="grid grid-cols-1 gap-6 lg:grid-cols-5 outline-none">
          {/* Settings Config Form */}
          <Card className="lg:col-span-3 h-fit">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Reputation Configurations</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set review redirect paths, threshold filters, and customized copy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Google Review Link</label>
                  <Input
                    placeholder="https://search.google.com/local/writereview?placeid=..."
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Get this from Google Business Profile manager (Share review form).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Gating Threshold</label>
                    <select
                      value={reviewThreshold}
                      onChange={(e) => setReviewThreshold(Number(e.target.value))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value={5}>5 Stars only</option>
                      <option value={4}>4 Stars or higher</option>
                      <option value={3}>3 Stars or higher</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground">
                      Ratings below this go to private feedback form.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-0.5 pr-2">
                      <label className="text-xs font-semibold text-foreground">Gating Active</label>
                      <p className="text-[10px] text-muted-foreground">Route negative reviews privately.</p>
                    </div>
                    <Switch
                      checked={gateReviews}
                      onCheckedChange={setGateReviews}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">WhatsApp Invitation Copy</label>
                  <textarea
                    value={smsTemplate}
                    onChange={(e) => setSmsTemplate(e.target.value)}
                    rows={4}
                    placeholder="Hi {{contact_name}}, thank you for choosing {{business_name}}! ..."
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    <span>Variables:</span>
                    <span className="font-semibold select-all bg-muted px-1 rounded">{"{{contact_name}}"}</span>
                    <span className="font-semibold select-all bg-muted px-1 rounded">{"{{business_name}}"}</span>
                    <span className="font-semibold select-all bg-muted px-1 rounded">{"{{review_link}}"}</span>
                  </div>
                </div>

                <Button type="submit" disabled={savingSettings} className="w-full font-semibold">
                  {savingSettings ? 'Saving settings...' : 'Save Configuration'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* QR Code Printable Card */}
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <QrCode className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-semibold">Checkout QR Code</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Print this QR poster for your receptionist or checkout desk.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 flex-1">
              <div className="bg-white border border-border p-4 rounded-xl shadow-inner">
                {qrLink ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrLink)}`}
                    alt="Checkout QR Code"
                    className="h-[180px] w-[180px] object-contain"
                  />
                ) : (
                  <div className="h-[180px] w-[180px] bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground">
                    Generating Link...
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
                Print Checkout Poster
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface Loader2Props extends React.SVGProps<SVGSVGElement> {}
function Loader2({ className, ...props }: Loader2Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
