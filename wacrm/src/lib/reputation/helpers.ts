import type { SupabaseClient } from '@supabase/supabase-js';
import {
  REVIEW_TAGS,
  type ReviewTag,
  type AIInsights,
  type StaffMember,
  type RewardSlice,
  type CustomerLoyaltyPass,
  DEFAULT_REWARDS,
} from '@/types/reputation';

/**
 * A rating is valid iff it is an integer in [1, 5]. Anything else
 * (fractional, NaN, negative, out-of-range) is rejected at the API
 * boundary so a malicious client cannot store garbage.
 */
export function isValidRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

/** Server-computed sentiment in [-1, 1] from a validated rating. */
export function computeSentiment(rating: number): number {
  return (rating - 3) / 2;
}

/**
 * Validate + normalize an untrusted rewards config. The public review
 * page must NEVER trust a client-sent `rewardsConfig` — always run it
 * through this and fall back to DEFAULT_REWARDS for anything malformed.
 */
export function sanitizeRewardsConfig(config: unknown): RewardSlice[] {
  if (!Array.isArray(config)) return DEFAULT_REWARDS;

  const cleaned = config.filter(
    (slice): slice is RewardSlice =>
      !!slice &&
      typeof slice === 'object' &&
      typeof (slice as { label?: unknown }).label === 'string' &&
      typeof (slice as { probability?: unknown }).probability === 'number' &&
      Number.isFinite((slice as { probability?: number }).probability) &&
      (slice as { probability?: number }).probability! >= 0 &&
      typeof (slice as { color?: unknown }).color === 'string',
  );

  return cleaned.length > 0 ? cleaned : DEFAULT_REWARDS;
}

export function composeReviewText(tags: ReviewTag[], voiceTranscript?: string): string {
  const tagText = tags
    .map((t) => REVIEW_TAGS.find((rt) => rt.key === t))
    .filter(Boolean)
    .map((rt) => rt!.key)
    .join(', ');

  if (voiceTranscript) {
    return `${voiceTranscript}${tagText ? `\n\nHighlights: ${tagText}.` : ''}`;
  }

  if (tagText) {
    return `I had a great experience! ${tagText}.\n\nHighly recommend this place!`;
  }

  return 'I had a wonderful experience. Highly recommend!';
}

export function pickReward(rewardsConfig: RewardSlice[]): RewardSlice {
  if (!Array.isArray(rewardsConfig) || rewardsConfig.length === 0) {
    return DEFAULT_REWARDS[0];
  }
  const rand = Math.random();
  let cumulative = 0;
  for (const slice of rewardsConfig) {
    cumulative += slice.probability;
    if (rand <= cumulative) return slice;
  }
  return rewardsConfig[rewardsConfig.length - 1];
}

export function generateDiscountCode(prefix = 'REWARD'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function upsertLoyaltyPass(
  db: SupabaseClient,
  accountId: string,
  contactId: string,
): Promise<CustomerLoyaltyPass | null> {
  const { data: existing } = await db
    .from('customer_loyalty_passes')
    .select('*')
    .eq('account_id', accountId)
    .eq('contact_id', contactId)
    .maybeSingle();

  if (existing) {
    const { data } = await db
      .from('customer_loyalty_passes')
      .update({
        total_visits: existing.total_visits + 1,
        stamps_count: existing.stamps_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    return data;
  }

  const { data } = await db
    .from('customer_loyalty_passes')
    .insert({
      account_id: accountId,
      contact_id: contactId,
      total_visits: 1,
      stamps_count: 1,
      rewards_unlocked: [],
    })
    .select()
    .single();

  return data;
}

export function calculateRewardExpiry(validDays: number = 15, now: Date = new Date()): { expiresAtIso: string; formattedDate: string } {
  const date = new Date(now);
  date.setDate(date.getDate() + (validDays || 15));
  const expiresAtIso = date.toISOString();
  const formattedDate = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return { expiresAtIso, formattedDate };
}

export async function getStaffAnalytics(
  db: SupabaseClient,
  accountId: string,
): Promise<(StaffMember & {
  total_scans: number;
  numbers_collected: number;
  links_opened: number;
  reviews_completed: number;
  average_rating: number | null;
  conversion_rate: number;
})[]> {
  const { data: staff } = await db
    .from('staff_members')
    .select('*')
    .eq('account_id', accountId)
    .order('name');

  if (!staff || staff.length === 0) return [];

  const staffIds = staff.map((s) => s.id);

  const { data: reviews } = await db
    .from('review_requests')
    .select('staff_id, rating, status')
    .eq('account_id', accountId)
    .in('staff_id', staffIds);

  const reviewsByStaff: Record<string, { rating: number | null; status: string }[]> = {};
  for (const r of reviews || []) {
    if (!r.staff_id) continue;
    if (!reviewsByStaff[r.staff_id]) reviewsByStaff[r.staff_id] = [];
    reviewsByStaff[r.staff_id].push(r);
  }

  return staff.map((member) => {
    const memberReviews = reviewsByStaff[member.id] || [];
    const numbersCollected = memberReviews.length;
    const linksOpened = memberReviews.filter((r) => ['opened', 'rated', 'clicked'].includes(r.status)).length;
    const reviewsCompleted = memberReviews.filter((r) => ['rated', 'clicked'].includes(r.status)).length;
    const rated = memberReviews.filter((r) => r.rating !== null);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length
        : null;
    const conversionRate = numbersCollected > 0 ? (reviewsCompleted / numbersCollected) * 100 : 0;

    return {
      ...member,
      total_scans: numbersCollected,
      numbers_collected: numbersCollected,
      links_opened: linksOpened,
      reviews_completed: reviewsCompleted,
      average_rating: avgRating,
      conversion_rate: conversionRate,
    };
  });
}

export async function getAIInsights(
  db: SupabaseClient,
  accountId: string,
): Promise<AIInsights> {
  const { data: reviews } = await db
    .from('review_requests')
    .select('rating, feedback, tags_selected, sentiment_score, created_at, table_number')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(500);

  const allReviews = reviews || [];

  const tagCounts: Record<string, number> = {};
  const lowTagCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const tableRatings: Record<string, { sum: number; count: number }> = {};

  for (const r of allReviews) {
    if (r.tags_selected) {
      for (const tag of r.tags_selected) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        if (r.rating !== null && r.rating < 4) {
          lowTagCounts[tag] = (lowTagCounts[tag] || 0) + 1;
        }
      }
    }

    if (r.created_at) {
      const hour = new Date(r.created_at).getHours();
      if (r.rating !== null && r.rating < 4) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    }

    if (r.table_number && r.rating !== null) {
      if (!tableRatings[r.table_number]) {
        tableRatings[r.table_number] = { sum: 0, count: 0 };
      }
      tableRatings[r.table_number].sum += r.rating;
      tableRatings[r.table_number].count += 1;
    }
  }

  const mostPraised = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([aspect, count]) => ({ aspect, count }));

  const mostComplained = Object.entries(lowTagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([aspect, count]) => ({ aspect, count }));

  const peakUnhappyHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([hour, count]) => ({ hour: Number(hour), count }));

  const branchTableHeatmap = Object.entries(tableRatings)
    .map(([table, data]) => ({
      table,
      avg_rating: data.sum / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topPraise = mostPraised[0]?.aspect || 'N/A';
  const topComplaint = mostComplained[0]?.aspect || 'N/A';
  const peakHour = peakUnhappyHours[0];
  const peakTimeStr = peakHour ? `${peakHour.hour}:00 - ${peakHour.hour + 1}:00` : 'N/A';

  const summary = `Top Praise: ${topPraise} | Top Complaint: ${topComplaint} | Peak Unhappy Time: ${peakTimeStr}`;

  return {
    most_praised: mostPraised,
    most_complained: mostComplained,
    peak_unhappy_hours: peakUnhappyHours,
    branch_table_heatmap: branchTableHeatmap,
    sentiment_trend: [],
    summary,
  };
}

export async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return '[Voice transcription unavailable]';

  try {
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('model', 'whisper-1');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    const data = await res.json();
    return data.text || '[Could not transcribe]';
  } catch {
    return '[Transcription failed]';
  }
}

export async function generateAIPolish(
  tags: ReviewTag[],
  voiceTranscript?: string,
): Promise<string> {
  const tagList = tags.join(', ');
  const prompt = `Write a natural, polished Google review (30-60 words) for a restaurant. ${tagList ? `Mention these aspects: ${tagList}.` : ''}${voiceTranscript ? ` The customer also said: "${voiceTranscript}"` : ''} Make it sound genuine and enthusiastic.`;

  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return composeReviewText(tags, voiceTranscript);

  try {
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || composeReviewText(tags, voiceTranscript);
    }

    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || composeReviewText(tags, voiceTranscript);
    }
  } catch {
    return composeReviewText(tags, voiceTranscript);
  }

  return composeReviewText(tags, voiceTranscript);
}
