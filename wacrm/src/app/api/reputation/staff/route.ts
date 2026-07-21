import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStaffAnalytics } from '@/lib/reputation/helpers'
import { supabaseAdmin } from '@/lib/flows/admin-client'

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

    const staff = await getStaffAnalytics(supabase, accountId)

    return NextResponse.json({ data: staff })
  } catch (error) {
    console.error('[reputation/staff/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabaseAdmin()

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
    const { name, role, avatar_url } = body as {
      name: string
      role?: string
      avatar_url?: string
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Staff name is required.' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
      '-' + Math.random().toString(36).substring(2, 6)

    const { data: member, error: insertError } = await db
      .from('staff_members')
      .insert({
        account_id: accountId,
        name: name.trim(),
        role: role || 'Staff',
        qr_slug: slug,
        avatar_url: avatar_url || null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ data: member })
  } catch (error) {
    console.error('[reputation/staff/POST] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const db = supabaseAdmin()

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

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('id')

    if (!staffId) {
      return NextResponse.json({ error: 'Staff id is required.' }, { status: 400 })
    }

    const { error: deleteError } = await db
      .from('staff_members')
      .delete()
      .eq('id', staffId)
      .eq('account_id', accountId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[reputation/staff/DELETE] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
