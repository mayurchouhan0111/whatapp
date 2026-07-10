import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { notifyAdminNewPayment } from '@/lib/email/send'

const PLAN_META: Record<string, { name: string; price: number }> = {
  free: { name: 'Free', price: 0 },
  starter: { name: 'Starter', price: 999 },
  growth: { name: 'Growth', price: 1999 },
  pro: { name: 'Pro', price: 3999 },
  enterprise: { name: 'Enterprise', price: 0 },
}

export async function POST(req: Request) {
  try {
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

    const formData = await req.formData()
    const planTier = formData.get('plan_tier') as string
    const utrNumber = formData.get('utr_number') as string
    const screenshot = formData.get('screenshot') as File | null

    if (!planTier || !utrNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planMeta = PLAN_META[planTier]
    if (!planMeta) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    let screenshotUrl = ''
    if (screenshot && screenshot.size > 0) {
      const ext = screenshot.name.split('.').pop() || 'png'
      const fileName = `payment-${user.id}-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabaseAdmin()
        .storage
        .from('payment-scans')
        .upload(fileName, screenshot, {
          contentType: screenshot.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('[payments] screenshot upload error:', uploadError)
      } else {
        const { data: { publicUrl } } = supabaseAdmin()
          .storage
          .from('payment-scans')
          .getPublicUrl(fileName)
        screenshotUrl = publicUrl
      }
    }

    const admin = supabaseAdmin()
    const { data: payment, error } = await admin
      .from('pending_payments')
      .insert({
        user_id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || 'Unknown',
        plan_tier: planTier,
        plan_name: planMeta.name,
        amount: planMeta.price,
        utr_number: utrNumber,
        screenshot_url: screenshotUrl,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[payments] insert error:', error)
      return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 })
    }

    // Notify admin (best-effort)
    notifyAdminNewPayment({
      name: user.user_metadata?.full_name || user.email || 'Unknown',
      email: user.email || '',
      plan_name: planMeta.name,
      amount: planMeta.price,
      utr_number: utrNumber,
      screenshot_url: screenshotUrl,
      payment_id: payment.id,
    })

    return NextResponse.json({ success: true, payment_id: payment.id })
  } catch (err: any) {
    console.error('[payments] submit error:', err)
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
