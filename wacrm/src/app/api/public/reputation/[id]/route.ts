import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import {
  handlePostReviewAutomation,
} from '@/lib/reputation/automation-handler'
import { upsertLoyaltyPass, pickReward, generateDiscountCode } from '@/lib/reputation/helpers'
import { DEFAULT_REWARDS } from '@/types/reputation'

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

    return NextResponse.json({
      data: {
        id: reviewRequest.id,
        businessName: account?.name || 'our business',
        contactName: contact?.name || 'Customer',
        contactPhone: contact?.phone || '',
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
          rewardsConfig: settings?.rewards_config || DEFAULT_REWARDS,
        },
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
      voiceTranscript,
      sentimentScore,
      recoveryActionRequested,
      spinRewardClaimed,
    } = body

    if (action === 'click_google') {
      const finalRating = rating || 5
      const rewardsConfig = body.rewardsConfig || DEFAULT_REWARDS
      const pickedReward = pickReward(rewardsConfig)
      const discountCode = generateDiscountCode()

      await db
        .from('review_requests')
        .update({
          status: 'clicked',
          rating: finalRating,
          clicked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags_selected: tagsSelected || null,
          ai_generated_text: aiGeneratedText || null,
          voice_transcript: voiceTranscript || null,
          sentiment_score: sentimentScore || null,
          spin_reward_claimed: pickedReward.label,
        })
        .eq('id', id)

      if (reviewRequest.contact_id) {
        await upsertLoyaltyPass(db, reviewRequest.account_id, reviewRequest.contact_id)
      }

      const contactPhone = (reviewRequest.contact as { phone?: string })?.phone || ''
      await handlePostReviewAutomation({
        accountId: reviewRequest.account_id,
        contactId: reviewRequest.contact_id,
        contactPhone,
        rating: finalRating,
        spinReward: pickedReward.label,
        discountCode,
      })

      return NextResponse.json({
        success: true,
        reward: {
          label: pickedReward.label,
          emoji: pickedReward.emoji,
          discountCode,
          discountPercent: pickedReward.discount_percent,
          color: pickedReward.color,
        },
      })
    }

    if (action === 'submit_feedback') {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Valid rating (1-5) is required.' }, { status: 400 })
      }

      await db
        .from('review_requests')
        .update({
          status: 'rated',
          rating,
          feedback: feedback || null,
          tags_selected: tagsSelected || null,
          ai_generated_text: aiGeneratedText || null,
          voice_transcript: voiceTranscript || null,
          sentiment_score: sentimentScore || null,
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

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action parameter.' }, { status: 400 })
  } catch (error) {
    console.error('[public/reputation/PUT] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
