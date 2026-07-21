'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Star, Send, Eye, MousePointerClick, MessageSquare, QrCode, Printer, Settings2,
  Search, RotateCcw, ExternalLink, Check, AlertCircle, User, Table as TableIcon,
  Gift, Sparkles, Award, Download, Plus, Trash2, Palette, Image, Mic, Zap,
  BrainCircuit, TrendingUp, TrendingDown, Clock, Hash, Copy,
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
import { DEFAULT_REWARDS, type RewardSlice, type ReviewTag, REVIEW_TAGS } from '@/types/reputation';
import type { AIInsights, StaffMember, CustomerLoyaltyPass } from '@/types/reputation';

interface Contact { id: string; name: string; phone: string; }
interface ReviewRequest {
  id: string; account_id: string; contact_id: string;
  status: 'sent' | 'opened' | 'rated' | 'clicked' | 'failed';
  rating: number | null; feedback: string | null;
  sent_at: string; opened_at: string | null; clicked_at: string | null;
  created_at: string; updated_at: string;
  staff_id: string | null; table_number: string | null;
  source_type: string | null; tags_selected: string[] | null;
  ai_generated_text: string | null; voice_transcript: string | null;
  sentiment_score: number | null;
  recovery_action_requested: string | null;
  recovery_status: string | null;
  spin_reward_claimed: string | null;
  contact?: Contact;
}
interface ReputationSettings {
  id: string; account_id: string; google_review_url: string;
  gate_reviews: boolean; review_threshold: number; sms_template: string;
  owner_photo_url: string | null; owner_name: string | null;
  welcome_message: string | null; branding_color: string; logo_url: string | null;
  enable_spin_wheel: boolean; enable_voice_review: boolean; enable_ai_chips: boolean;
  rewards_config: RewardSlice[];
}

export default function ReputationDashboardPage() {
  const { accountId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [settings, setSettings] = useState<ReputationSettings | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loyaltyPasses, setLoyaltyPasses] = useState<any[]>([]);

  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [gateReviews, setGateReviews] = useState(true);
  const [reviewThreshold, setReviewThreshold] = useState(4);
  const [smsTemplate, setSmsTemplate] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrLink, setQrLink] = useState('');

  // V2 settings
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [brandingColor, setBrandingColor] = useState('#f59e0b');
  const [logoUrl, setLogoUrl] = useState('');
  const [enableSpinWheel, setEnableSpinWheel] = useState(true);
  const [enableVoiceReview, setEnableVoiceReview] = useState(true);
  const [enableAiChips, setEnableAiChips] = useState(true);
  const [rewardsConfig, setRewardsConfig] = useState<RewardSlice[]>(DEFAULT_REWARDS);

  // Staff management
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);

  // Poster builder
  const [posterHook, setPosterHook] = useState('We Value Your Feedback!');
  const [posterSize, setPosterSize] = useState<'A6' | 'A5' | 'sticker'>('A5');
  const [showStars, setShowStars] = useState(true);
  const [showOwner, setShowOwner] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, setRes, insightsRes, staffRes, loyaltyRes] = await Promise.all([
        fetch('/api/reputation/requests'),
        fetch('/api/reputation/settings'),
        fetch('/api/reputation/ai-insights'),
        fetch('/api/reputation/staff'),
        fetch('/api/reputation/loyalty'),
      ]);

      if (reqRes.ok) { const p = await reqRes.json(); setRequests(p.data || []); }
      if (setRes.ok) {
        const p = await setRes.json(); const c = p.data;
        if (c) {
          setSettings(c);
          setGoogleReviewUrl(c.google_review_url || '');
          setGateReviews(c.gate_reviews !== false);
          setReviewThreshold(c.review_threshold ?? 4);
          setSmsTemplate(c.sms_template || '');
          setOwnerPhotoUrl(c.owner_photo_url || '');
          setOwnerName(c.owner_name || '');
          setWelcomeMessage(c.welcome_message || '');
          setBrandingColor(c.branding_color || '#f59e0b');
          setLogoUrl(c.logo_url || '');
          setEnableSpinWheel(c.enable_spin_wheel !== false);
          setEnableVoiceReview(c.enable_voice_review !== false);
          setEnableAiChips(c.enable_ai_chips !== false);
          setRewardsConfig(c.rewards_config || DEFAULT_REWARDS);
        }
      }
      if (insightsRes.ok) { const p = await insightsRes.json(); setInsights(p.data); }
      if (staffRes.ok) { const p = await staffRes.json(); setStaff(p.data || []); }
      if (loyaltyRes.ok) { const p = await loyaltyRes.json(); setLoyaltyPasses(p.data || []); }
    } catch (error) {
      console.error('[reputation] Failed to load data:', error);
      toast.error('Failed to load reputation logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const host = window.location.host;
    const protocol = window.location.protocol;
    setQrLink(`${protocol}//${host}/r/qr/${accountId}`);
  }, [loadData, accountId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleReviewUrl.trim()) { toast.error('Google Review URL is required.'); return; }
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
          owner_photo_url: ownerPhotoUrl.trim() || null,
          owner_name: ownerName.trim() || null,
          welcome_message: welcomeMessage.trim() || null,
          branding_color: brandingColor,
          logo_url: logoUrl.trim() || null,
          enable_spin_wheel: enableSpinWheel,
          enable_voice_review: enableVoiceReview,
          enable_ai_chips: enableAiChips,
          rewards_config: rewardsConfig,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to save settings');
      toast.success('Reputation settings saved successfully.');
      setSettings(payload.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setSavingSettings(false); }
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) return;
    setSavingStaff(true);
    try {
      const res = await fetch('/api/reputation/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStaffName.trim(), role: newStaffRole.trim() || 'Staff' }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error);
      toast.success('Staff member added!');
      setNewStaffName('');
      setNewStaffRole('');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add staff.');
    } finally { setSavingStaff(false); }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/reputation/staff?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Staff member removed.');
      loadData();
    } catch { toast.error('Failed to delete staff.'); }
  };

  const handlePrintQR = (qrData?: string) => {
    const link = qrData || qrLink;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sizeClass = posterSize === 'A6' ? 'max-w-[320px]' : posterSize === 'A5' ? 'max-w-[420px]' : 'max-w-[300px]';
    const starSection = showStars ? `
      <div style="margin: 16px 0; font-size: 28px; letter-spacing: 4px;">
        ⭐⭐⭐⭐⭐
      </div>` : '';

    const ownerSection = showOwner && settings?.owner_photo_url ? `
      <div style="margin: 12px 0;">
        <img src="${settings.owner_photo_url}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid ${brandingColor};margin:0 auto;" />
        <p style="font-size:13px;color:#666;margin-top:4px;">${settings.owner_name || 'Owner'}</p>
      </div>` : '';

    printWindow.document.write(`
      <html><head><title>Print Review Poster</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 90vh; text-align: center; padding: 20px; margin: 0; }
          .poster { border: 3px solid ${brandingColor}; border-radius: 24px; padding: 40px 32px; ${sizeClass}; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
          h1 { font-size: 28px; margin-bottom: 4px; color: #111; }
          h2 { font-size: 16px; font-weight: 500; color: #555; margin-bottom: 24px; }
          .qr-box { background: #fff; border: 2px solid #ddd; padding: 20px; border-radius: 16px; display: inline-block; margin: 16px 0; }
          .hook { font-size: 18px; font-weight: bold; color: ${brandingColor}; margin: 12px 0; }
          .small { font-size: 13px; color: #888; margin-top: 8px; }
        </style>
      </head><body>
        <div class="poster">
          ${settings?.logo_url ? `<img src="${settings.logo_url}" style="height:48px;margin:0 auto 12px;object-fit:contain;" />` : ''}
          <h1>${posterHook}</h1>
          <h2>Scan to share your experience</h2>
          ${ownerSection}
          ${starSection}
          <div class="qr-box">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}" style="width:200px;height:200px;" />
          </div>
          <div class="hook">Scan the QR Code</div>
          <div class="small">Use your phone camera to rate your experience</div>
        </div>
        <script>window.onload=function(){window.print();};<\/script>
      </body></html>
    `);
    printWindow.document.close();
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
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resend request failed.', { id: 'resend' });
    }
  };

  const totalSent = requests.length;
  const openedCount = requests.filter(r => ['opened', 'rated', 'clicked'].includes(r.status)).length;
  const openRate = totalSent > 0 ? (openedCount / totalSent) * 100 : 0;
  const clickedCount = requests.filter(r => r.status === 'clicked').length;
  const clickThroughRate = totalSent > 0 ? (clickedCount / totalSent) * 100 : 0;
  const ratedReqs = requests.filter(r => r.rating !== null && r.rating > 0);
  const avgRating = ratedReqs.length > 0 ? ratedReqs.reduce((s, r) => s + (r.rating || 0), 0) / ratedReqs.length : 0;

  const ratingCounts = [0, 0, 0, 0, 0];
  ratedReqs.forEach(r => { if (r.rating && r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++; });
  const maxCount = Math.max(...ratingCounts, 1);

  const privateFeedbacks = requests.filter(r => r.rating !== null && r.rating < (settings?.review_threshold ?? 4) && r.feedback);

  const filteredRequests = requests.filter(r => {
    const n = r.contact?.name || ''; const p = r.contact?.phone || ''; const q = searchTerm.toLowerCase();
    return n.toLowerCase().includes(q) || p.includes(q);
  });

  const getStatusBadge = (status: ReviewRequest['status']) => {
    const config: Record<string, { text: string; className: string }> = {
      sent: { text: 'Sent', className: 'bg-blue-500/10 text-blue-500 border-blue-500/25' },
      opened: { text: 'Opened', className: 'bg-amber-500/10 text-amber-500 border-amber-500/25' },
      clicked: { text: 'Google Review', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' },
      rated: { text: 'Private Review', className: 'bg-green-500/10 text-green-500 border-green-500/25' },
      failed: { text: 'Failed', className: 'bg-rose-500/10 text-rose-500 border-rose-500/25' },
    };
    const c = config[status] || { text: status, className: '' };
    return <Badge variant="outline" className={`font-semibold ${c.className}`}>{c.text}</Badge>;
  };

  const renderStars = (num: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= num ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reputation & Reviews</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered customer experience platform — collect reviews, analyze sentiment, manage loyalty.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="flex items-center gap-2 self-start sm:self-center">
          <RotateCcw className="h-4 w-4" /> Reload
        </Button>
      </div>

      {!settings?.google_review_url && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-start gap-4 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="space-y-1">
              <h4 className="font-bold">Google Review link is not configured</h4>
              <p className="text-xs text-muted-foreground">
                Go to <strong>Settings</strong> tab to input your Google Business Profile URL.
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-1.5"><Star className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-1.5"><User className="h-4 w-4" /> Staff</TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Recovery</TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-1.5"><Gift className="h-4 w-4" /> Loyalty</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5"><Settings2 className="h-4 w-4" /> Settings</TabsTrigger>
        </TabsList>

        {/* === OVERVIEW & AI INSIGHTS === */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card><CardHeader className="p-4 pb-2"><CardDescription className="text-xs font-semibold">Total Sent</CardDescription></CardHeader>
              <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{totalSent}</div></CardContent></Card>
            <Card><CardHeader className="p-4 pb-2"><CardDescription className="text-xs font-semibold">Open Rate</CardDescription></CardHeader>
              <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{openRate.toFixed(1)}%</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Eye className="h-3 w-3" /><span>{openedCount} opens</span></div>
              </CardContent></Card>
            <Card><CardHeader className="p-4 pb-2"><CardDescription className="text-xs font-semibold">Google Clicks</CardDescription></CardHeader>
              <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{clickThroughRate.toFixed(1)}%</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><MousePointerClick className="h-3 w-3" /><span>{clickedCount} clicks</span></div>
              </CardContent></Card>
            <Card><CardHeader className="p-4 pb-2"><CardDescription className="text-xs font-semibold">Avg Rating</CardDescription></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
                  {avgRating > 0 && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                </div>
              </CardContent></Card>
          </div>

          {/* AI Insights Summary */}
          {insights && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-semibold">AI Insights Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{insights.summary}</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mb-1">
                      <TrendingUp className="h-3 w-3" /> Most Praised
                    </div>
                    {insights.most_praised.slice(0, 3).map((p, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{p.aspect}</span>
                        <Badge variant="secondary" className="text-[10px]">{p.count}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 mb-1">
                      <TrendingDown className="h-3 w-3" /> Most Complaints
                    </div>
                    {insights.most_complained.slice(0, 3).map((p, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{p.aspect}</span>
                        <Badge variant="secondary" className="text-[10px]">{p.count}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 mb-1">
                      <Clock className="h-3 w-3" /> Peak Unhappy Hours
                    </div>
                    {insights.peak_unhappy_hours.slice(0, 3).map((p, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{p.hour}:00 - {p.hour + 1}:00</span>
                        <Badge variant="secondary" className="text-[10px]">{p.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-sm font-semibold">Rating Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map(s => {
                  const c = ratingCounts[s - 1];
                  const pct = (c / maxCount) * 100;
                  return (
                    <div key={s} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-medium flex items-center gap-1">{s} <Star className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                      <div className="flex-1 h-2.5 bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground font-semibold">{c}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="text-sm font-semibold">Private Feedback Feed</CardTitle>
                <CardDescription className="text-xs">Reviews below {settings?.review_threshold ?? 4} stars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {privateFeedbacks.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground">No gated private feedback received.</p>
                    </div>
                  ) : privateFeedbacks.map(fb => (
                    <div key={fb.id} className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{fb.contact?.name || 'Anonymous'}</div>
                        <div className="text-[10px] text-muted-foreground">{format(new Date(fb.created_at), 'MMM d, yyyy HH:mm')}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        {renderStars(fb.rating || 0)}
                        <Badge variant="secondary" className="text-[10px]">{fb.contact?.phone}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap italic mt-1 bg-background/50 rounded-lg p-2 border border-border/30">"{fb.feedback}"</p>
                      {fb.recovery_action_requested && (
                        <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-500/30">
                          Recovery: {fb.recovery_action_requested}
                        </Badge>
                      )}
                      <div className="flex justify-end pt-1">
                        <a href={`/inbox?contactId=${fb.contact_id}`} className={buttonVariants({ variant: 'link', size: 'xs', className: 'text-xs text-primary px-0 flex items-center gap-1.5' })}>
                          Open Inbox <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Heatmap */}
          {insights?.branch_table_heatmap && insights.branch_table_heatmap.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Table/Area Heatmap</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {insights.branch_table_heatmap.map(t => {
                    const intensity = Math.round(((t.avg_rating - 1) / 4) * 100);
                    return (
                      <div key={t.table} className="rounded-lg border p-2 text-center" style={{ backgroundColor: `hsl(${120 * intensity / 100}, 60%, 90%)` }}>
                        <div className="text-xs font-bold">{t.table}</div>
                        <div className="text-[10px] text-muted-foreground">{t.avg_rating.toFixed(1)}★</div>
                        <div className="text-[10px] text-muted-foreground">{t.count} visits</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === STAFF & QR ATTRIBUTION === */}
        <TabsContent value="staff" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Staff Members</CardTitle>
                  <CardDescription className="text-xs">Manage staff and track their review attribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Staff name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="max-w-xs" />
                <Input placeholder="Role (optional)" value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} className="max-w-[160px]" />
                <Button onClick={handleAddStaff} disabled={savingStaff || !newStaffName.trim()} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Staff
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Scans</TableHead>
                    <TableHead>Avg Rating</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>QR Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">No staff members added yet.</TableCell></TableRow>
                  ) : staff.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{s.role}</span></TableCell>
                      <TableCell><Badge variant="secondary">{s.total_scans || 0}</Badge></TableCell>
                      <TableCell>{s.average_rating ? renderStars(Math.round(s.average_rating)) : '—'}</TableCell>
                      <TableCell>{(s.conversion_rate || 0).toFixed(1)}%</TableCell>
                      <TableCell><code className="text-[10px] bg-muted px-1 py-0.5 rounded">{s.qr_slug || '—'}</code></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" onClick={() => {
                            const staffQr = `${window.location.protocol}//${window.location.host}/r/qr/${accountId}?staff=${encodeURIComponent(s.name)}`;
                            handlePrintQR(staffQr);
                          }}>
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => handleDeleteStaff(s.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === RECOVERY & PRIVATE FEEDBACKS === */}
        <TabsContent value="recovery" className="space-y-6 outline-none">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Recovery Inbox</CardTitle>
              <CardDescription className="text-xs">Low-star ratings needing attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Recovery Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.filter(r => r.rating !== null && r.rating < (settings?.review_threshold ?? 4)).length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">No recovery items.</TableCell></TableRow>
                  ) : requests.filter(r => r.rating !== null && r.rating < (settings?.review_threshold ?? 4)).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <div className="text-sm">{r.contact?.name || 'Customer'}</div>
                        <div className="text-xs text-muted-foreground">{r.contact?.phone}</div>
                      </TableCell>
                      <TableCell>{renderStars(r.rating || 0)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">{r.feedback || '—'}</TableCell>
                      <TableCell>
                        {r.recovery_action_requested ? (
                          <Badge variant="outline" className="text-[10px]">{r.recovery_action_requested}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {r.recovery_status ? (
                          <Badge variant="outline" className={`text-[10px] ${
                            r.recovery_status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                            r.recovery_status === 'manager_contacted' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          }`}>
                            {r.recovery_status.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'MMM d')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`https://wa.me/${r.contact?.phone?.replace('+', '')}`} target="_blank" rel="noreferrer"
                            className={buttonVariants({ variant: 'outline', size: 'xs' })}>
                            <MessageSquare className="h-3 w-3 mr-1" /> WhatsApp
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === LOYALTY & REWARDS === */}
        <TabsContent value="loyalty" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Spin-the-Wheel Rewards</CardTitle>
                <CardDescription className="text-xs">Configure reward slices and probabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rewardsConfig.map((slice, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: slice.color + '20' }}>
                        {slice.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{slice.label}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {(slice.probability * 100).toFixed(0)}% chance
                          {slice.discount_percent ? ` | ${slice.discount_percent}% OFF` : ''}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={Math.round(slice.probability * 100)}
                        onChange={(e) => {
                          const newConfig = [...rewardsConfig];
                          newConfig[i] = { ...slice, probability: Number(e.target.value) / 100 };
                          setRewardsConfig(newConfig);
                        }}
                        className="w-20 h-1.5"
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => toast.success('Rewards updated!')} className="w-full">
                    <Check className="h-4 w-4 mr-1" /> Save Reward Config
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Loyalty Passes</CardTitle>
                <CardDescription className="text-xs">Customer visit tracking and stamp cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {loyaltyPasses.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <Award className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No loyalty passes yet.</p>
                    </div>
                  ) : loyaltyPasses.map((lp: any) => (
                    <div key={lp.id} className="rounded-lg border p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{lp.contact?.name || 'Customer'}</div>
                        <div className="text-xs text-muted-foreground">{lp.total_visits} visits | {lp.stamps_count} stamps</div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} className={`h-6 w-6 rounded text-[10px] flex items-center justify-center font-bold ${
                            s <= (lp.stamps_count || 0) ? 'bg-amber-400 text-white' : 'bg-muted text-muted-foreground/30'
                          }`}>
                            {s <= (lp.stamps_count || 0) ? '⭐' : s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === SETTINGS (MERGED V1+V2) === */}
        <TabsContent value="settings" className="grid grid-cols-1 gap-6 lg:grid-cols-5 outline-none">
          <Card className="lg:col-span-3 h-fit">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Brand & Review Settings</CardTitle>
              <CardDescription className="text-xs">
                Configure your review flow, branding, AI features, and rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Google Review Link</label>
                  <Input placeholder="https://search.google.com/local/writereview?placeid=..." value={googleReviewUrl} onChange={e => setGoogleReviewUrl(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Gating Threshold</label>
                    <select value={reviewThreshold} onChange={e => setReviewThreshold(Number(e.target.value))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none shadow-sm focus-visible:ring-1 focus-visible:ring-ring">
                      <option value={5}>5 Stars only</option>
                      <option value={4}>4 Stars or higher</option>
                      <option value={3}>3 Stars or higher</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-0.5 pr-2">
                      <label className="text-xs font-semibold text-foreground">Gating Active</label>
                      <p className="text-[10px] text-muted-foreground">Route negative reviews privately.</p>
                    </div>
                    <Switch checked={gateReviews} onCheckedChange={setGateReviews} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Brand Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={brandingColor} onChange={e => setBrandingColor(e.target.value)} className="h-9 w-9 rounded cursor-pointer" />
                      <Input value={brandingColor} onChange={e => setBrandingColor(e.target.value)} placeholder="#f59e0b" className="font-mono text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Owner Name</label>
                    <Input placeholder="John Doe" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Owner Photo URL</label>
                  <Input placeholder="https://example.com/photo.jpg" value={ownerPhotoUrl} onChange={e => setOwnerPhotoUrl(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Business Logo URL</label>
                  <Input placeholder="https://example.com/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Welcome Message</label>
                  <textarea value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)}
                    rows={2} placeholder="Thank you for visiting! We'd love your feedback."
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">WhatsApp Invitation Template</label>
                  <textarea value={smsTemplate} onChange={e => setSmsTemplate(e.target.value)}
                    rows={3} placeholder="Hi {{contact_name}}, thank you for choosing {{business_name}}! ..."
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    <span>Variables:</span>
                    <span className="font-semibold select-all bg-muted px-1 rounded">{'{{contact_name}}'}</span>
                    <span className="font-semibold select-all bg-muted px-1 rounded">{'{{business_name}}'}</span>
                    <span className="font-semibold select-all bg-muted px-1 rounded">{'{{review_link}}'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-0.5 pr-2">
                      <label className="text-xs font-semibold text-foreground">Spin Wheel</label>
                      <p className="text-[10px] text-muted-foreground">Enable gamification</p>
                    </div>
                    <Switch checked={enableSpinWheel} onCheckedChange={setEnableSpinWheel} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-0.5 pr-2">
                      <label className="text-xs font-semibold text-foreground">Voice Review</label>
                      <p className="text-[10px] text-muted-foreground">Enable voice recording</p>
                    </div>
                    <Switch checked={enableVoiceReview} onCheckedChange={setEnableVoiceReview} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-0.5 pr-2">
                      <label className="text-xs font-semibold text-foreground">AI Chips</label>
                      <p className="text-[10px] text-muted-foreground">Enable review tags</p>
                    </div>
                    <Switch checked={enableAiChips} onCheckedChange={setEnableAiChips} />
                  </div>
                </div>

                <Button type="submit" disabled={savingSettings} className="w-full font-semibold">
                  {savingSettings ? 'Saving settings...' : 'Save Configuration'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* QR + Poster Builder */}
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <QrCode className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-semibold">Poster & Standee Designer</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Design and print QR review posters for your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Promotional Hook</label>
                <Input value={posterHook} onChange={e => setPosterHook(e.target.value)} placeholder="We Value Your Feedback!" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['A6', 'A5', 'sticker'] as const).map(size => (
                  <button key={size} type="button" onClick={() => setPosterSize(size)}
                    className={`rounded-lg border p-2 text-xs font-medium transition-all ${
                      posterSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}>
                    {size === 'A6' ? 'Table Tent' : size === 'A5' ? 'Standee' : 'Sticker'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={showStars} onChange={e => setShowStars(e.target.checked)} />
                  Show Stars
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={showOwner} onChange={e => setShowOwner(e.target.checked)} />
                  Show Owner Photo
                </label>
              </div>
              {/* Live Preview */}
              <div className="rounded-xl border-2 p-4 text-center" style={{ borderColor: brandingColor }}>
                {logoUrl && <img src={logoUrl} className="h-8 mx-auto mb-2 object-contain" alt="Logo" />}
                <p className="text-sm font-bold">{posterHook}</p>
                <p className="text-[10px] text-muted-foreground">Scan to share your experience</p>
                {showOwner && ownerPhotoUrl && (
                  <img src={ownerPhotoUrl} className="h-10 w-10 rounded-full mx-auto my-2 object-cover border-2" style={{ borderColor: brandingColor }} alt="Owner" />
                )}
                {showStars && <p className="text-lg my-1">⭐⭐⭐⭐⭐</p>}
                <div className="bg-white border p-2 rounded-lg inline-block my-2">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrLink)}`} className="h-[100px] w-[100px] object-contain" alt="QR" />
                </div>
              </div>
            </CardContent>
            <div className="p-6 border-t bg-muted/10">
              <div className="flex gap-2">
                <Button onClick={() => handlePrintQR()} variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Printer className="h-4 w-4" /> Print Poster
                </Button>
                <Button onClick={() => {
                  const staffLink = `${window.location.protocol}//${window.location.host}/r/qr/${accountId}`;
                  navigator.clipboard.writeText(staffLink);
                  toast.success('QR link copied!');
                }} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Loader2({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`} {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
