import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import {
  handlePostReviewAutomation,
} from '@/lib/reputation/automation-handler'
import {
  upsertLoyaltyPass,
  pickReward,
  generateDiscountCode,
  calculateRewardExpiry,
  sanitizeRewardsConfig,
  computeSentiment,
  isValidRating,
} from '@/lib/reputation/helpers'
import { DEFAULT_REWARDS } from '@/types/reputation'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import type { RewardSlice } from '@/types/reputation'

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

function bindReward(reward: RewardSlice, discountCode: string, expiresAt: string, expiresAtIso: string) {
  return {
    label: reward.label,
    emoji: reward.emoji,
    discountCode,
    discountPercent: reward.discount_percent || 15,
    color: reward.color,
    expiresAt,
    expiresAtIso,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = supabaseAdmin()

    if (!id) {
      return NextResponse.json({ error: 'Missing request ID.' }, { status: 400 })
    }

    const rl = checkRateLimit(`reputation-read:${clientIp(request)}`, RATE_LIMITS.reputationRead)
    if (!rl.success) return rateLimitResponse(rl)

    const { data: reviewRequest, error: reqErr } = await db
      .from('review_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (reqErr || !reviewRequest) {
      return NextResponse.json({ error: 'Review request not found.' }, { status: 404 })
    }

    const { data: account } = await db
      .from('accounts')
      .select('name')
      .eq('id', reviewRequest.account_id)
      .single()

    const { data: settings } = await db
      .from('reputation_settings')
      .select('*')
      .eq('account_id', reviewRequest.account_id)
      .single()

    const { data: contact } = await db
      .from('contacts')
      .select('name, phone')
      .eq('id', reviewRequest.contact_id)
      .single()

    const { data: staffMember } = reviewRequest.staff_id
      ? await db.from('staff_members').select('name, role').eq('id', reviewRequest.staff_id).single()
      : { data: null }

    if (reviewRequest.status === 'sent') {
      await db
        .from('review_requests')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('id', id)
    }

    const { data: loyalty } = await db
      .from('customer_loyalty_passes')
      .select('total_visits, stamps_count')
      .eq('account_id', reviewRequest.account_id)
      .eq('contact_id', reviewRequest.contact_id)
      .maybeSingle()

    return NextResponse.json({
      data: {
        id: reviewRequest.id,
        businessName: account?.name || 'our business',
        contactName: contact?.name || 'Customer',
        googleReviewUrl: settings?.google_review_url || '',
        gateReviews: settings?.gate_reviews !== false,
        reviewThreshold: settings?.review_threshold ?? 4,
        status: reviewRequest.status === 'sent' ? 'opened' : reviewRequest.status,
        rating: reviewRequest.rating,
        staffMember: staffMember
          ? { name: staffMember.name, role: staffMember.role }
          : null,
        v2: {
          ownerPhotoUrl: settings?.owner_photo_url || null,
          ownerName: settings?.owner_name || null,
          welcomeMessage: settings?.welcome_message || null,
          brandingColor: settings?.branding_color || '#f59e0b',
          logoUrl: settings?.logo_url || null,
          enableSpinWheel: settings?.enable_spin_wheel !== false,
          enableVoiceReview: settings?.enable_voice_review !== false,
          enableAiChips: settings?.enable_ai_chips !== false,
          rewardsConfig: sanitizeRewardsConfig(settings?.rewards_config),
          rewardValidDays: settings?.reward_valid_days || 15,
        },
        loyalty: loyalty
          ? { total_visits: loyalty.total_visits, stamps_count: loyalty.stamps_count }
          : null,
      },
    })
  } catch (error) {
    console.error('[public/reputation/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = supabaseAdmin()

    if (!id) {
      return NextResponse.json({ error: 'Missing request ID.' }, { status: 400 })
    }

    const rl = checkRateLimit(`reputation-write:${clientIp(request)}`, RATE_LIMITS.reputationWrite)
    if (!rl.success) return rateLimitResponse(rl)

    const { data: reviewRequest, error: reqErr } = await db
      .from('review_requests')
      .select('*, contact:contacts(phone)')
      .eq('id', id)
      .maybeSingle()

    if (reqErr || !reviewRequest) {
      return NextResponse.json({ error: 'Review request not found.' }, { status: 404 })
    }

    const body = await request.json()
    const {
      rating,
      feedback,
      action,
      tagsSelected,
      aiGeneratedText,
      recoveryActionRequested,
    } = body

    if (action === 'click_google') {
      if (!isValidRating(rating)) {
        return NextResponse.json({ error: 'Valid rating (1-5) is required.' }, { status: 400 })
      }

      // Idempotency: a review request can only ever be claimed once.
      // Replays (double-taps, refreshes, back-button) must return the
      // already-stored coupon instead of minting a second one.
      if (
        reviewRequest.status === 'clicked' &&
        reviewRequest.discount_code &&
        reviewRequest.spin_reward_claimed
      ) {
        const reward: RewardSlice = {
          label: reviewRequest.spin_reward_claimed,
          emoji: '🎁',
          probability: 0,
          color: DEFAULT_REWARDS[0].color,
        }
        return NextResponse.json({
          success: true,
          alreadyClaimed: true,
          reward: bindReward(
            reward,
            reviewRequest.discount_code,
            reviewRequest.reward_expires_at || '',
            reviewRequest.reward_expires_at || '',
          ),
        })
      }

      // Rewards come from the owner's saved config in the DB — never
      // from the client. A tampered `rewardsConfig` body is ignored.
      const { data: settings } = await db
        .from('reputation_settings')
        .select('rewards_config, reward_valid_days, enable_spin_wheel')
        .eq('account_id', reviewRequest.account_id)
        .maybeSingle()

      const validDays = settings?.reward_valid_days || 15
      const spinEnabled = settings?.enable_spin_wheel !== false
      const pickedReward = pickReward(sanitizeRewardsConfig(settings?.rewards_config))
      const discountCode = spinEnabled ? generateDiscountCode() : null
      const { expiresAtIso, formattedDate } = spinEnabled
        ? calculateRewardExpiry(validDays)
        : { expiresAtIso: null, formattedDate: null }

      const sentiment = computeSentiment(rating)

      await db
        .from('review_requests')
        .update({
          status: 'clicked',
          rating,
          clicked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags_selected: Array.isArray(tagsSelected) ? tagsSelected : null,
          ai_generated_text: aiGeneratedText || null,
          sentiment_score: sentiment,
          spin_reward_claimed: spinEnabled ? pickedReward.label : null,
          discount_code: discountCode,
          reward_expires_at: expiresAtIso,
        })
        .eq('id', id)

      if (reviewRequest.contact_id && !spinEnabled) {
        await upsertLoyaltyPass(db, reviewRequest.account_id, reviewRequest.contact_id)
      }

      const contactPhone = (reviewRequest.contact as { phone?: string })?.phone || ''
      await handlePostReviewAutomation({
        accountId: reviewRequest.account_id,
        contactId: reviewRequest.contact_id,
        contactPhone,
        rating,
        spinReward: spinEnabled ? pickedReward.label : undefined,
        discountCode: discountCode || undefined,
      })

      return NextResponse.json({
        success: true,
        reward: spinEnabled
          ? bindReward(pickedReward, discountCode!, expiresAtIso!, formattedDate!)
          : null,
      })
    }

    if (action === 'submit_feedback') {
      if (!isValidRating(rating)) {
        return NextResponse.json({ error: 'Valid rating (1-5) is required.' }, { status: 400 })
      }

      const alreadyRated = reviewRequest.status === 'rated'

      await db
        .from('review_requests')
        .update({
          status: 'rated',
          rating,
          feedback: feedback || null,
          tags_selected: Array.isArray(tagsSelected) ? tagsSelected : null,
          ai_generated_text: aiGeneratedText || null,
          sentiment_score: computeSentiment(rating),
          recovery_action_requested: recoveryActionRequested || null,
          recovery_status: recoveryActionRequested ? 'pending' : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      const starsStr = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
      const tagStr = tagsSelected?.length ? `\nTags: ${tagsSelected.join(', ')}` : ''
      const recoveryStr = recoveryActionRequested
        ? `\nRecovery Requested: ${recoveryActionRequested}`
        : ''
      const noteContent = `[Google Review Page] Star Rating: ${rating}/5 ${starsStr}${tagStr}${recoveryStr}\nPrivate Feedback: "${feedback || '(None)'}"`

      // Insert the private note + fire recovery automation only on the
      // first submission — replays would otherwise stack duplicate
      // notes and re-send recovery WhatsApps.
      if (!alreadyRated) {
        await db.from('contact_notes').insert({
          contact_id: reviewRequest.contact_id,
          account_id: reviewRequest.account_id,
          note_text: noteContent,
        })

        const contactPhone = (reviewRequest.contact as { phone?: string })?.phone || ''
        await handlePostReviewAutomation({
          accountId: reviewRequest.account_id,
          contactId: reviewRequest.contact_id,
          contactPhone,
          rating,
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action parameter.' }, { status: 400 })
  } catch (error) {
    console.error('[public/reputation/PUT] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
