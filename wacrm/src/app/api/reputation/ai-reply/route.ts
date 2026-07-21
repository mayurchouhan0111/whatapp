import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAIReply } from '@/lib/reputation/helpers'

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
      return NextResponse.json({ error: 'Profile is not linked to an account.' }, { status: 403 })
    }

    const body = await request.json()
    const { reviewText, rating } = body as { reviewText: string; rating: number }

    if (!reviewText || typeof rating !== 'number') {
      return NextResponse.json({ error: 'reviewText and rating are required.' }, { status: 400 })
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .single()

    const businessName = account?.name || 'our business'
    const reply = await generateAIReply(reviewText, rating, businessName)

    return NextResponse.json({ data: { reply } })
  } catch (error) {
    console.error('[ai-reply] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
