import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const accountId = profile?.account_id
    if (!accountId) {
      return NextResponse.json(
        { error: 'Profile is not linked to an account.' },
        { status: 403 }
      )
    }

    const { data: settings, error: settingsError } = await supabase
      .from('reputation_settings')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    if (settingsError) {
      console.error('[reputation/settings/GET] failed:', settingsError.message)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[reputation/settings/GET] internal error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const accountId = profile?.account_id
    if (!accountId) {
      return NextResponse.json(
        { error: 'Profile is not linked to an account.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      google_review_url,
      gate_reviews,
      review_threshold,
      sms_template,
      owner_photo_url,
      owner_name,
      welcome_message,
      branding_color,
      logo_url,
      enable_spin_wheel,
      enable_voice_review,
      enable_ai_chips,
      rewards_config,
    } = body

    const updateData: Record<string, unknown> = {
      account_id: accountId,
      updated_at: new Date().toISOString(),
    }

    if (google_review_url !== undefined) updateData.google_review_url = google_review_url
    if (gate_reviews !== undefined) updateData.gate_reviews = gate_reviews
    if (review_threshold !== undefined) updateData.review_threshold = review_threshold
    if (sms_template !== undefined) updateData.sms_template = sms_template || null
    if (owner_photo_url !== undefined) updateData.owner_photo_url = owner_photo_url || null
    if (owner_name !== undefined) updateData.owner_name = owner_name || null
    if (welcome_message !== undefined) updateData.welcome_message = welcome_message || null
    if (branding_color !== undefined) updateData.branding_color = branding_color
    if (logo_url !== undefined) updateData.logo_url = logo_url || null
    if (enable_spin_wheel !== undefined) updateData.enable_spin_wheel = enable_spin_wheel
    if (enable_voice_review !== undefined) updateData.enable_voice_review = enable_voice_review
    if (enable_ai_chips !== undefined) updateData.enable_ai_chips = enable_ai_chips
    if (rewards_config !== undefined) updateData.rewards_config = rewards_config

    if (!google_review_url) {
      return NextResponse.json(
        { error: 'google_review_url is required.' },
        { status: 400 }
      )
    }

    const { data: settings, error: upsertError } = await supabase
      .from('reputation_settings')
      .upsert(updateData, { onConflict: 'account_id' })
      .select()
      .single()

    if (upsertError) {
      console.error('[reputation/settings/POST] failed:', upsertError.message)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[reputation/settings/POST] internal error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
