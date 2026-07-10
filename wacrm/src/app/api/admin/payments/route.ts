import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function checkSuperAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  return profile?.is_super_admin === true
}

export async function GET(req: Request) {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pending'

  const admin = supabaseAdmin()
  const { data: payments } = await admin
    .from('pending_payments')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  return NextResponse.json(payments || [])
}
