import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { sendTextMessage } from '@/lib/whatsapp/meta-api'
import { decrypt } from '@/lib/whatsapp/encryption'
import {
  sanitizePhoneForMeta,
  isValidE164,
  phoneVariants,
  isRecipientNotAllowedError,
} from '@/lib/whatsapp/phone-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId parameter.' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Fetch account details
    const { data: account, error: accErr } = await db
      .from('accounts')
      .select('id, name')
      .eq('id', accountId)
      .maybeSingle()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Business account not found.' }, { status: 404 })
    }

    // Fetch staff list for this account
    const { data: staffList } = await db
      .from('staff_members')
      .select('id, name, role')
      .eq('account_id', accountId)
      .eq('is_active', true)
      .order('name')

    return NextResponse.json({
      data: {
        businessName: account.name,
        staff: staffList || [],
      },
    })
  } catch (error) {
    console.error('[public/reputation/staff/collect/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = supabaseAdmin()
    const body = await request.json()
    const { accountId, phone, name, staffId, tableNumber } = body as {
      accountId: string
      phone: string
      name?: string
      staffId?: string
      tableNumber?: string
    }

    if (!accountId || !phone?.trim()) {
      return NextResponse.json(
        { error: 'accountId and phone are required.' },
        { status: 400 }
      )
    }

    const sanitizedPhone = sanitizePhoneForMeta(phone)
    if (!isValidE164(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please provide valid international format (e.g. +919876543210).' },
        { status: 400 }
      )
    }

    // Fetch account details
    const { data: account, error: accErr } = await db
      .from('accounts')
      .select('id, name, owner_user_id')
      .eq('id', accountId)
      .maybeSingle()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Business account not found.' }, { status: 404 })
    }

    const customerName = name?.trim() || 'Valued Customer'

    // 1. Upsert Contact
    const { data: existingContact } = await db
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .eq('phone', sanitizedPhone)
      .maybeSingle()

    let contactId = existingContact?.id

    if (!contactId) {
      const { data: newContact, error: contactError } = await db
        .from('contacts')
        .insert({
          account_id: accountId,
          user_id: account.owner_user_id,
          name: customerName,
          phone: sanitizedPhone,
        })
        .select('id')
        .single()

      if (contactError || !newContact) {
        return NextResponse.json(
          { error: `Failed to create contact: ${contactError?.message}` },
          { status: 500 }
        )
      }
      contactId = newContact.id
    }

    // 2. Fetch reputation settings
    const { data: settings } = await db
      .from('reputation_settings')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    // 3. Create review_request entry
    const { data: reviewRequest, error: requestError } = await db
      .from('review_requests')
      .insert({
        account_id: accountId,
        contact_id: contactId,
        staff_id: staffId || null,
        table_number: tableNumber?.trim() || null,
        source_type: 'direct_link',
        status: 'sent',
      })
      .select()
      .single()

    if (requestError || !reviewRequest) {
      return NextResponse.json(
        { error: `Failed to create review request: ${requestError?.message}` },
        { status: 500 }
      )
    }

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const reviewLink = `${siteUrl}/r/${reviewRequest.id}`

    // 4. Send WhatsApp message if configured
    let sentViaWhatsapp = false
    const { data: whatsappConfig } = await db
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    if (whatsappConfig && whatsappConfig.phone_number_id && whatsappConfig.access_token) {
      try {
        const accessToken = decrypt(whatsappConfig.access_token)
        const { data: account } = await db
          .from('accounts')
          .select('name')
          .eq('id', accountId)
          .single()

        const businessName = account?.name || 'our restaurant'
        let messageText = settings?.sms_template ||
          'Hi {{contact_name}}, thank you for dining with us at {{business_name}}! We value your feedback. Please click here to rate your experience and spin the wheel for rewards: {{review_link}}'

        messageText = messageText
          .replace(/\{\{contact_name\}\}/g, customerName)
          .replace(/\{\{business_name\}\}/g, businessName)
          .replace(/\{\{review_link\}\}/g, reviewLink)

        let { data: conversation } = await db
          .from('conversations')
          .select('id')
          .eq('account_id', accountId)
          .eq('contact_id', contactId)
          .maybeSingle()

        if (!conversation) {
          const { data: newConv } = await db
            .from('conversations')
            .insert({
              account_id: accountId,
              contact_id: contactId,
              status: 'open',
              last_message_text: messageText,
              last_message_at: new Date().toISOString(),
            })
            .select('id')
            .single()
          conversation = newConv
        }

        const variants = phoneVariants(sanitizedPhone)
        for (const v of variants) {
          try {
            const waMsgId = await sendTextMessage({
              phoneNumberId: whatsappConfig.phone_number_id,
              accessToken,
              to: v,
              text: messageText,
            })

            if (conversation?.id) {
              await db.from('messages').insert({
                conversation_id: conversation.id,
                sender_type: 'bot',
                content_type: 'text',
                content_text: messageText,
                message_id: waMsgId.messageId,
                status: 'sent',
              })
            }
            sentViaWhatsapp = true
            break
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (!isRecipientNotAllowedError(msg)) break
          }
        }
      } catch (waErr) {
        console.error('[public/staff/collect] WhatsApp error:', waErr)
      }
    }

    return NextResponse.json({
      success: true,
      data: reviewRequest,
      reviewLink,
      sentViaWhatsapp,
    })
  } catch (error) {
    console.error('[public/reputation/staff/collect/POST] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
