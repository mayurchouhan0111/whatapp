import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
      return NextResponse.json(
        { error: 'Profile is not linked to an account.' },
        { status: 403 }
      )
    }

    const { data: requests, error: requestsError } = await supabase
      .from('review_requests')
      .select('*, contact:contacts(*)')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('[reputation/requests/GET] failed:', requestsError.message)
      return NextResponse.json({ error: requestsError.message }, { status: 500 })
    }

    return NextResponse.json({ data: requests })
  } catch (error) {
    console.error('[reputation/requests/GET] internal error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: 'Profile is not linked to an account.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { contact_id } = body

    if (!contact_id) {
      return NextResponse.json(
        { error: 'contact_id is required.' },
        { status: 400 }
      )
    }

    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contact_id)
      .eq('account_id', accountId)
      .single()

    if (contactErr || !contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied.' },
        { status: 404 }
      )
    }

    const { data: settings, error: settingsError } = await supabase
      .from('reputation_settings')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    if (settingsError || !settings?.google_review_url) {
      return NextResponse.json(
        { error: 'Google Review URL is not configured. Please configure it in Reputation Settings first.' },
        { status: 400 }
      )
    }

    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('account_id', accountId)
      .eq('contact_id', contact_id)
      .maybeSingle()

    if (!conversation) {
      const { data: newConv, error: newConvError } = await supabase
        .from('conversations')
        .insert({
          account_id: accountId,
          contact_id: contact_id,
          status: 'open',
          last_message_text: '[Review Request Initiated]',
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (newConvError || !newConv) {
        console.error('[reputation/requests/POST] failed to create conversation:', newConvError?.message)
        return NextResponse.json(
          { error: 'Failed to initialize conversation for the contact.' },
          { status: 500 }
        )
      }
      conversation = newConv
    }

    const { data: reviewRequest, error: insertError } = await supabase
      .from('review_requests')
      .insert({
        account_id: accountId,
        contact_id: contact_id,
        status: 'sent',
      })
      .select()
      .single()

    if (insertError || !reviewRequest) {
      console.error('[reputation/requests/POST] insert request failed:', insertError?.message)
      return NextResponse.json({ error: 'Failed to log review request.' }, { status: 500 })
    }

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const reviewLink = `${siteUrl}/r/${reviewRequest.id}`

    const { data: account } = await supabase
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .single()

    const businessName = account?.name || 'our business'
    const contactName = contact.name || 'there'

    let messageText = settings.sms_template || 'Hi {{contact_name}}, thank you for choosing {{business_name}}! We would appreciate it if you could take 30 seconds to review your experience: {{review_link}}'
    messageText = messageText
      .replace(/\{\{contact_name\}\}/g, contactName)
      .replace(/\{\{business_name\}\}/g, businessName)
      .replace(/\{\{review_link\}\}/g, reviewLink)

    const { data: whatsappConfig, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .single()

    if (configError || !whatsappConfig) {
      await supabase.from('review_requests').delete().eq('id', reviewRequest.id)
      return NextResponse.json(
        { error: 'WhatsApp not configured for this account. Please connect your phone number first.' },
        { status: 400 }
      )
    }

    const accessToken = decrypt(whatsappConfig.access_token)
    const sanitizedPhone = sanitizePhoneForMeta(contact.phone)
    if (!isValidE164(sanitizedPhone)) {
      await supabase.from('review_requests').delete().eq('id', reviewRequest.id)
      return NextResponse.json(
        { error: 'Invalid contact phone number format.' },
        { status: 400 }
      )
    }

    const attemptSend = async (phone: string): Promise<string> => {
      const res = await sendTextMessage({
        phoneNumberId: whatsappConfig.phone_number_id,
        accessToken,
        to: phone,
        text: messageText,
      })
      return res.messageId
    }

    const variants = phoneVariants(sanitizedPhone)
    let workingPhone = sanitizedPhone
    let waMessageId = ''
    let lastSendError: unknown = null

    for (const v of variants) {
      try {
        waMessageId = await attemptSend(v)
        workingPhone = v
        lastSendError = null
        break
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!isRecipientNotAllowedError(msg)) throw err
        lastSendError = err
      }
    }

    if (lastSendError) {
      console.error('[reputation/requests/POST] Meta sending failed:', lastSendError)
      await supabase.from('review_requests').update({ status: 'failed' }).eq('id', reviewRequest.id)
      return NextResponse.json(
        { error: `WhatsApp sending failed: ${(lastSendError as Error).message}` },
        { status: 502 }
      )
    }

    if (workingPhone !== sanitizedPhone) {
      await supabase
        .from('contacts')
        .update({ phone: workingPhone })
        .eq('id', contact.id)
    }

    const { error: msgInsertError } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'bot',
      content_type: 'text',
      content_text: messageText,
      message_id: waMessageId,
      status: 'sent',
    })

    if (msgInsertError) {
      console.error('[reputation/requests/POST] failed to insert message in conversation history:', msgInsertError.message)
    }

    await supabase
      .from('conversations')
      .update({
        last_message_text: messageText,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    return NextResponse.json({ success: true, data: reviewRequest })
  } catch (error) {
    console.error('[reputation/requests/POST] internal error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
