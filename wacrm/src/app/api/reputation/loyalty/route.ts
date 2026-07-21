import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: passes, error: passesError } = await supabase
      .from('customer_loyalty_passes')
      .select('*, contact:contacts(name, phone)')
      .eq('account_id', accountId)
      .order('total_visits', { ascending: false })
      .limit(50)

    if (passesError) {
      return NextResponse.json({ error: passesError.message }, { status: 500 })
    }

    return NextResponse.json({ data: passes })
  } catch (error) {
    console.error('[reputation/loyalty/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
