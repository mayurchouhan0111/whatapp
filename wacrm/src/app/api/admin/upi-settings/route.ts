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

export async function GET() {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = supabaseAdmin()
  const { data } = await admin
    .from('upi_payment_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  return NextResponse.json(data ?? { upi_id: '', account_name: '', qr_image_url: '' })
}

export async function PUT(req: Request) {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { upi_id, account_name, qr_image_url } = body

  const admin = supabaseAdmin()

  const { data: existing } = await admin
    .from('upi_payment_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing) {
    await admin
      .from('upi_payment_settings')
      .update({
        upi_id: upi_id ?? '',
        account_name: account_name ?? '',
        qr_image_url: qr_image_url ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await admin
      .from('upi_payment_settings')
      .insert({ upi_id: upi_id ?? '', account_name: account_name ?? '', qr_image_url: qr_image_url ?? '' })
  }

  return NextResponse.json({ success: true })
}
