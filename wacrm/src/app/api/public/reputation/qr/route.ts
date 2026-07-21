import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { sanitizePhoneForMeta, isValidE164 } from '@/lib/whatsapp/phone-utils'
import { findExistingContact, isUniqueViolation } from '@/lib/contacts/dedupe'

export async function GET(request: Request) {
  try {
    const db = supabaseAdmin()
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId parameter.' }, { status: 400 })
    }

    const { data: account, error: accErr } = await db
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .maybeSingle()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Business account not found.' }, { status: 404 })
    }

    const { data: settings } = await db
      .from('reputation_settings')
      .select('owner_photo_url, owner_name, welcome_message, branding_color, logo_url')
      .eq('account_id', accountId)
      .maybeSingle()

    return NextResponse.json({
      data: {
        name: account.name,
        v2: {
          ownerPhotoUrl: settings?.owner_photo_url || null,
          ownerName: settings?.owner_name || null,
          welcomeMessage: settings?.welcome_message || null,
          brandingColor: settings?.branding_color || '#f59e0b',
          logoUrl: settings?.logo_url || null,
        },
      },
    })
  } catch (error) {
    console.error('[public/reputation/qr/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = supabaseAdmin()
    const body = await request.json()
    const { name, phone, accountId, staffId, tableNumber } = body

    if (!name || !phone || !accountId) {
      return NextResponse.json(
        { error: 'Name, phone, and accountId are required.' },
        { status: 400 }
      )
    }

    const sanitizedPhone = sanitizePhoneForMeta(phone)
    if (!isValidE164(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid mobile phone number format.' },
        { status: 400 }
      )
    }

    const { data: account, error: accErr } = await db
      .from('accounts')
      .select('id, name, owner_user_id')
      .eq('id', accountId)
      .maybeSingle()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Business account not found.' }, { status: 404 })
    }

    let contact: any = null
    try {
      contact = await findExistingContact(db, accountId, sanitizedPhone)
    } catch (contactErr: any) {
      console.error('[public/reputation/qr] contact lookup failed:', contactErr.message)
    }

    const phoneForStorage = phone.startsWith('+') ? phone : `+${sanitizedPhone}`

    if (!contact) {
      const { data: newContact, error: createError } = await db
        .from('contacts')
        .insert({
          account_id: accountId,
          user_id: account.owner_user_id,
          name: name.trim(),
          phone: phoneForStorage,
        })
        .select()
        .single()

      if (createError) {
        console.error('[public/reputation/qr] create contact failed:', createError)
        if (isUniqueViolation(createError)) {
          contact = await findExistingContact(db, accountId, sanitizedPhone)
        }

        if (!contact) {
          return NextResponse.json(
            { error: `Failed to register customer contact: ${createError.message}` },
            { status: 500 }
          )
        }
      } else if (newContact) {
        contact = newContact
      } else {
        return NextResponse.json(
          { error: 'Contact created but no data returned.' },
          { status: 500 }
        )
      }
    } else {
      if (
        !contact.name ||
        contact.name.toLowerCase() === 'customer' ||
        contact.name.toLowerCase() === 'there'
      ) {
        await db
          .from('contacts')
          .update({ name: name.trim() })
          .eq('id', contact.id)
      }
    }

    const insertData: any = {
      account_id: accountId,
      contact_id: contact.id,
      status: 'opened',
      opened_at: new Date().toISOString(),
      source_type: 'qr_web',
    }

    if (staffId) insertData.staff_id = staffId
    if (tableNumber) insertData.table_number = tableNumber

    const { data: reviewRequest, error: reqError } = await db
      .from('review_requests')
      .insert(insertData)
      .select()
      .single()

    if (reqError || !reviewRequest) {
      console.error('[public/reputation/qr] failed to create review request:', reqError?.message)
      return NextResponse.json({ error: 'Failed to create review session.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reviewRequestId: reviewRequest.id,
    })
  } catch (error) {
    console.error('[public/reputation/qr/POST] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
