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

    return NextResponse.json({ data: { name: account.name } })
  } catch (error) {
    console.error('[public/reputation/qr/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = supabaseAdmin()
    const body = await request.json()
    const { name, phone, accountId } = body

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

    // Verify account exists
    const { data: account, error: accErr } = await db
      .from('accounts')
      .select('id, name, owner_user_id')
      .eq('id', accountId)
      .maybeSingle()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Business account not found.' }, { status: 404 })
    }

    // Check if the contact already exists under this account
    let contact: any = null
    try {
      contact = await findExistingContact(db, accountId, sanitizedPhone)
    } catch (contactErr: any) {
      console.error('[public/reputation/qr] contact lookup failed:', contactErr.message)
    }

    // Create contact if they don't exist yet
    if (!contact) {
      const { data: newContact, error: createError } = await db
        .from('contacts')
        .insert({
          account_id: accountId,
          user_id: account.owner_user_id,
          name: name.trim(),
          phone: sanitizedPhone,
        })
        .select()
        .single()

      if (createError) {
        if (isUniqueViolation(createError)) {
          // If we lost a race or there was a unique constraint collision on phone_normalized,
          // try to resolve the existing contact.
          contact = await findExistingContact(db, accountId, sanitizedPhone)
        }
        
        if (!contact) {
          console.error('[public/reputation/qr] create contact failed:', createError?.message)
          return NextResponse.json({ error: 'Failed to register customer contact.' }, { status: 500 })
        }
      } else {
        contact = newContact
      }
    } else {
      // If contact exists, update name if empty or generic
      if (!contact.name || contact.name.toLowerCase() === 'customer' || contact.name.toLowerCase() === 'there') {
        await db
          .from('contacts')
          .update({ name: name.trim() })
          .eq('id', contact.id)
      }
    }

    // Create a review request session
    const { data: reviewRequest, error: reqError } = await db
      .from('review_requests')
      .insert({
        account_id: accountId,
        contact_id: contact.id,
        status: 'opened',
        opened_at: new Date().toISOString(),
      })
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
