import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'

export async function GET() {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('upi_payment_settings')
    .select('upi_id, account_name, qr_image_url')
    .limit(1)
    .maybeSingle()

  return NextResponse.json(data ?? { upi_id: '', account_name: '', qr_image_url: '' })
}
