import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateHumanizedReply } from '@/lib/reputation/ai-engine'
import { buildCustomerContext } from '@/lib/reputation/context-builder'
import { checkFeatureGate, checkPlanLimit } from '@/lib/billing/limits'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import type { BrandVoice } from '@/types/reputation'

const MAX_REVIEW_LENGTH = 2000
const MAX_NAME_LENGTH = 100

interface AiReplyBody {
  reviewText: string
  rating: number
  customerName?: unknown
  contactId?: unknown
  brandVoice?: {
    tone?: unknown
    style?: unknown
    customInstructions?: unknown
  }
}

function cleanBrandVoice(input: AiReplyBody['brandVoice']): Partial<BrandVoice> {
  if (!input || typeof input !== 'object') return {}
  const tone = input.tone
  const validTone = ['warm', 'professional', 'casual', 'empathetic'].includes(String(tone))
  const clean: Partial<BrandVoice> = {}
  if (validTone) clean.tone = tone as BrandVoice['tone']
  if (typeof input.style === 'string' && input.style.trim()) clean.style = input.style.trim().slice(0, 500)
  if (typeof input.customInstructions === 'string' && input.customInstructions.trim()) {
    clean.customInstructions = input.customInstructions.trim().slice(0, 1000)
  }
  return clean
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rate = checkRateLimit(`ai-reply:${user.id}`, RATE_LIMITS.adminAction)
    if (!rate.success) return rateLimitResponse(rate)

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const accountId = profile?.account_id
    if (!accountId) {
      return NextResponse.json({ error: 'Profile is not linked to an account.' }, { status: 403 })
    }

    const reputationEnabled = await checkFeatureGate(accountId, 'reputation')
    if (!reputationEnabled) {
      return NextResponse.json(
        { error: 'Reputation tools are not enabled on your plan. Please upgrade.' },
        { status: 403 },
      )
    }

    const replyLimit = await checkPlanLimit(accountId, 'review_requests_per_month')
    if (!replyLimit.allowed) {
      return NextResponse.json({ error: replyLimit.message }, { status: 403 })
    }

    let body: AiReplyBody
    try {
      body = (await request.json()) as AiReplyBody
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const { reviewText, rating, customerName, contactId } = body

    if (typeof reviewText !== 'string' || !reviewText.trim()) {
      return NextResponse.json({ error: 'reviewText is required.' }, { status: 400 })
    }
    if (reviewText.length > MAX_REVIEW_LENGTH) {
      return NextResponse.json({ error: `reviewText must be under ${MAX_REVIEW_LENGTH} characters.` }, { status: 400 })
    }
    if (typeof rating !== 'number' || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be a number between 1 and 5.' }, { status: 400 })
    }
    if (customerName !== undefined && customerName !== null && typeof customerName !== 'string') {
      return NextResponse.json({ error: 'customerName must be a string.' }, { status: 400 })
    }
    const cleanName = typeof customerName === 'string' ? customerName.trim().slice(0, MAX_NAME_LENGTH) : undefined
    const brandVoice = cleanBrandVoice(body.brandVoice)

    const { data: account } = await supabase
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .single()

    const businessName = account?.name || 'our business'

    // Load persisted brand voice from reputation_settings (owner-configured wins
    // over anything passed from the client for the trusted fields).
    const { data: settings } = await supabase
      .from('reputation_settings')
      .select('brand_voice')
      .eq('account_id', accountId)
      .maybeSingle()

    const persistedVoice = (settings?.brand_voice ?? {}) as Partial<BrandVoice>
    const mergedVoice: Partial<BrandVoice> = {
      tone:
        persistedVoice.tone && ['warm', 'professional', 'casual', 'empathetic'].includes(persistedVoice.tone)
          ? persistedVoice.tone
          : brandVoice.tone ?? undefined,
      style: persistedVoice.style ?? brandVoice.style,
      customInstructions: persistedVoice.customInstructions ?? brandVoice.customInstructions,
    }

    // Build real customer context when a contact is known.
    let context
    if (typeof contactId === 'string' && contactId) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('name')
        .eq('id', contactId)
        .eq('account_id', accountId)
        .maybeSingle()

      const { data: pastReviews } = await supabase
        .from('review_requests')
        .select('rating, feedback, created_at')
        .eq('account_id', accountId)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(20)

      context = buildCustomerContext(contact?.name || cleanName || '', pastReviews ?? [])
    }

    const result = await generateHumanizedReply({
      reviewText: reviewText.trim(),
      rating,
      businessName,
      customerName: cleanName,
      brandVoice: mergedVoice,
      context,
    })

    // Persist metrics when the review request is known.
    if (typeof contactId === 'string' && contactId) {
      const { data: latest } = await supabase
        .from('review_requests')
        .select('id')
        .eq('account_id', accountId)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latest?.id) {
        await supabase
          .from('review_requests')
          .update({
            ai_confidence_score: result.confidenceScore,
            ai_model_used: result.modelUsed,
            response_time_ms: result.responseTimeMs,
          })
          .eq('id', latest.id)
      }
    }

    return NextResponse.json({
      data: {
        reply: result.reply,
        confidence_score: result.confidenceScore,
        model_used: result.modelUsed,
        response_time_ms: result.responseTimeMs,
        humanized: result.humanized,
      },
    })
  } catch (error) {
    console.error('[ai-reply] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}