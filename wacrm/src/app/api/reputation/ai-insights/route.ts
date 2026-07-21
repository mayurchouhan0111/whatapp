import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIInsights } from '@/lib/reputation/helpers'

export async function GET() {
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
      return NextResponse.json({ error: 'Profile is not linked to an account.' }, { status: 403 })
    }

    const insights = await getAIInsights(supabase, accountId)

    return NextResponse.json({ data: insights })
  } catch (error) {
    console.error('[ai-insights] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
