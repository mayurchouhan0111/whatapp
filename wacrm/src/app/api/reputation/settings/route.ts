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
    const { google_review_url, gate_reviews, review_threshold, sms_template } = body

    if (!google_review_url) {
      return NextResponse.json(
        { error: 'google_review_url is required.' },
        { status: 400 }
      )
    }

    const { data: settings, error: upsertError } = await supabase
      .from('reputation_settings')
      .upsert(
        {
          account_id: accountId,
          google_review_url,
          gate_reviews: gate_reviews !== false,
          review_threshold: typeof review_threshold === 'number' ? review_threshold : 4,
          sms_template: sms_template || undefined,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'account_id' }
      )
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
