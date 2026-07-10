import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notifyPaymentApproved, notifyPaymentRejected } from '@/lib/email/send'

async function getSuperAdminUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_super_admin, user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile?.is_super_admin) return null
  return user.id
}

const PLAN_NAME_MAP: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Pro',
  pro: 'Pro',
  enterprise: 'Pro',
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const adminId = await getSuperAdminUserId()
  if (!adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { action, notes } = body

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const admin = supabaseAdmin()

  const { data: payment } = await admin
    .from('pending_payments')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  if (payment.status !== 'pending' && payment.status !== 'info_requested') {
    return NextResponse.json({ error: 'Payment already processed' }, { status: 400 })
  }

  if (action === 'approve') {
    const dbPlanName = PLAN_NAME_MAP[payment.plan_tier] || 'Free'

    const { data: plans } = await admin
      .from('saas_plans')
      .select('id')
      .ilike('name', dbPlanName)

    if (!plans || plans.length === 0) {
      return NextResponse.json({ error: 'Plan not found in database' }, { status: 500 })
    }

    const accountName = payment.name
      ? `${payment.name}'s Workspace`
      : 'My Workspace'

    const { error: rpcError } = await admin.rpc('provision_workspace', {
      p_user_id: payment.user_id,
      p_plan_id: plans[0].id,
      p_account_name: accountName,
      p_stripe_subscription_id: 'upi_sub_' + Math.random().toString(36).substring(7),
    })

    if (rpcError) {
      console.error('[admin/payments] provision error:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    await admin
      .from('pending_payments')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || '',
      })
      .eq('id', id)

    try {
      await notifyPaymentApproved({
        email: payment.email,
        name: payment.name,
        plan_name: payment.plan_name,
      })
    } catch (emailErr) {
      console.error('[admin/payments] approval email failed:', emailErr)
    }

    return NextResponse.json({ success: true, action: 'approved' })
  }

  if (action === 'reject') {
    await admin
      .from('pending_payments')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || '',
      })
      .eq('id', id)

    try {
      await notifyPaymentRejected({
        email: payment.email,
        name: payment.name,
        plan_name: payment.plan_name,
        reason: notes || '',
      })
    } catch (emailErr) {
      console.error('[admin/payments] rejection email failed:', emailErr)
    }

    return NextResponse.json({ success: true, action: 'rejected' })
  }
}
