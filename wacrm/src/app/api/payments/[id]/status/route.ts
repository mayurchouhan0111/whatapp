import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/flows/admin-client'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = supabaseAdmin()
  const { data: payment } = await admin
    .from('pending_payments')
    .select('id, status, admin_notes, plan_name, amount, utr_number, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  // User can only check their own payment
  const { data: paymentOwner } = await admin
    .from('pending_payments')
    .select('user_id')
    .eq('id', id)
    .single()

  if (paymentOwner?.user_id !== user.id) {
    const { data: profile } = await admin
      .from('profiles')
      .select('is_super_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.json({
    id: payment.id,
    status: payment.status,
    admin_notes: payment.admin_notes,
    plan_name: payment.plan_name,
    amount: payment.amount,
    utr_number: payment.utr_number,
    created_at: payment.created_at,
  })
}
