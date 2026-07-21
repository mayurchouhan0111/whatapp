import type { SupabaseClient } from '@supabase/supabase-js';
import {
  REVIEW_TAGS,
  type ReviewTag,
  type ReviewRequestV2,
  type AIInsights,
  type StaffMember,
  type RewardSlice,
  type CustomerLoyaltyPass,
} from '@/types/reputation';

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

export async function getStaffAnalytics(
  db: SupabaseClient,
  accountId: string,
): Promise<(StaffMember & { total_scans: number; average_rating: number | null; conversion_rate: number })[]> {
  const { data: staff } = await db
    .from('staff_members')
    .select('*')
    .eq('account_id', accountId)
    .order('name');

  if (!staff) return [];

  const results = [];
  for (const member of staff) {
    const { data: reviews } = await db
      .from('review_requests')
      .select('rating, status')
      .eq('account_id', accountId)
      .eq('staff_id', member.id);

    const totalScans = reviews?.length || 0;
    const rated = reviews?.filter((r) => r.rating !== null) || [];
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length
        : null;
    const clicked = reviews?.filter((r) => r.status === 'clicked').length || 0;
    const conversionRate = totalScans > 0 ? (clicked / totalScans) * 100 : 0;

    results.push({
      ...member,
      total_scans: totalScans,
      average_rating: avgRating,
      conversion_rate: conversionRate,
    });
  }

  return results;
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

export async function generateAIReply(
  reviewText: string,
  rating: number,
  businessName: string,
): Promise<string> {
  const prompt = `Generate a professional, warm, brand-aligned Google review response for a ${rating}-star review that says: "${reviewText}". Business: ${businessName}. Keep it under 150 words, thank them, and if negative acknowledge the issue politely.`;

  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackReply(reviewText, rating);
  }

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
          messages: [
            { role: 'system', content: 'You are a professional customer experience manager.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || fallbackReply(reviewText, rating);
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
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || fallbackReply(reviewText, rating);
    }
  } catch {
    return fallbackReply(reviewText, rating);
  }

  return fallbackReply(reviewText, rating);
}

function fallbackReply(reviewText: string, rating: number): string {
  if (rating >= 4) {
    return `Thank you so much for your wonderful ${rating}-star review! We're thrilled you had a great experience with us. Your feedback means the world to our team, and we look forward to serving you again soon!`;
  }
  return `Thank you for your feedback. We're sorry your experience didn't meet expectations. We take all reviews seriously and will use your input to improve. Please reach out to us directly so we can make things right.`;
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
