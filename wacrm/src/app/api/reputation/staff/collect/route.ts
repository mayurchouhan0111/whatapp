import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTextMessage, sendTemplateMessage } from '@/lib/whatsapp/meta-api'
import { isMessageTemplate } from '@/lib/whatsapp/template-row-guard'
import { decrypt } from '@/lib/whatsapp/encryption'
import {
  sanitizePhoneForMeta,
  formatE164Phone,
  isValidE164,
  phoneVariants,
  isRecipientNotAllowedError,
} from '@/lib/whatsapp/phone-utils'
import { checkFeatureGate, checkPlanLimit } from '@/lib/billing/limits'
function safeDecryptToken(rawToken: string): string {
  if (!rawToken) return ''
  if (!rawToken.includes(':')) return rawToken
  try {
    return decrypt(rawToken)
  } catch {
    return rawToken
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

    const reputationEnabled = await checkFeatureGate(accountId, 'reputation')
    if (!reputationEnabled) {
      return NextResponse.json(
        { error: 'Reputation tools are not enabled on your plan. Please upgrade.' },
        { status: 403 },
      )
    }

    const reviewLimit = await checkPlanLimit(accountId, 'review_requests_per_month')
    if (!reviewLimit.allowed) {
      return NextResponse.json({ error: reviewLimit.message }, { status: 403 })
    }

    const body = await request.json()
    const { name, phone, staff_id, table_number } = body as {
      name?: string
      phone: string
      staff_id?: string
      table_number?: string
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Customer phone number is required.' },
        { status: 400 }
      )
    }

    const formattedPhone = formatE164Phone(phone)
    const sanitizedPhone = sanitizePhoneForMeta(phone)
    if (!isValidE164(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please provide valid international format (e.g. +919876543210).' },
        { status: 400 }
      )
    }

    const customerName = name?.trim() || 'Valued Customer'

    const { data: account } = await supabase
      .from('accounts')
      .select('owner_user_id, name')
      .eq('id', accountId)
      .maybeSingle()

    // 1. Upsert or find Contact
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .or(`phone.eq.${formattedPhone},phone.eq.${sanitizedPhone}`)
      .maybeSingle()

    let contactId = existingContact?.id

    if (!contactId) {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          account_id: accountId,
          user_id: user.id || account?.owner_user_id,
          name: customerName,
          phone: formattedPhone,
        })
        .select('id')
        .single()

      if (contactError || !newContact) {
        return NextResponse.json(
          { error: `Failed to register contact: ${contactError?.message || 'Unknown error'}` },
          { status: 500 }
        )
      }
      contactId = newContact.id
    }

    // 2. Fetch reputation settings
    const { data: settings } = await supabase
      .from('reputation_settings')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    // 3. Create review_request entry linked to staff & table
    const { data: reviewRequest, error: requestError } = await supabase
      .from('review_requests')
      .insert({
        account_id: accountId,
        contact_id: contactId,
        staff_id: staff_id || null,
        table_number: table_number?.trim() || null,
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

    const businessName = account?.name || 'our restaurant'
    let messageText = settings?.sms_template ||
      'Hi {{contact_name}}, thank you for dining with us at {{business_name}}! We value your feedback. Please click here to rate your experience and spin the wheel for rewards: {{review_link}}'

    messageText = messageText
      .replace(/\{\{contact_name\}\}/g, customerName)
      .replace(/\{\{business_name\}\}/g, businessName)
      .replace(/\{\{review_link\}\}/g, reviewLink)

    // ALWAYS create/ensure conversation row exists so contact appears in Inbox
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('account_id', accountId)
      .eq('contact_id', contactId)
      .maybeSingle()

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          account_id: accountId,
          user_id: user.id || account?.owner_user_id,
          contact_id: contactId,
          status: 'open',
          last_message_text: messageText,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      conversation = newConv
    } else {
      await supabase
        .from('conversations')
        .update({
          last_message_text: messageText,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversation.id)
    }

    // Record review invite message in database chat history
    let storedMessageId: string | null = null
    if (conversation?.id) {
      const { data: msgRec } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'bot',
          content_type: 'text',
          content_text: messageText,
          status: 'sent',
        })
        .select('id')
        .single()
      storedMessageId = msgRec?.id || null
    }

    // 4. Try sending via WhatsApp if configured
    let sentViaWhatsapp = false
    let waErrorReason: string | null = null

    const { data: whatsappConfig } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle()

    if (!whatsappConfig) {
      waErrorReason = 'No WhatsApp Business configuration found for this account.'
    } else if (!whatsappConfig.phone_number_id || !whatsappConfig.access_token) {
      waErrorReason = 'WhatsApp Phone Number ID or Access Token is missing.'
    } else {
      try {
        const accessToken = safeDecryptToken(whatsappConfig.access_token)

        // Check if a dedicated review template exists (e.g. 'review_request') or any approved review template (excluding hello_world)
        let { data: appTemplate } = await supabase
          .from('message_templates')
          .select('*')
          .eq('account_id', accountId)
          .eq('status', 'APPROVED')
          .neq('name', 'hello_world')
          .ilike('name', '%review%')
          .limit(1)
          .maybeSingle()

        const variants = phoneVariants(sanitizedPhone)
        for (const v of variants) {
          try {
            let waMsgId: { messageId: string }
            if (appTemplate && isMessageTemplate(appTemplate)) {
              try {
                waMsgId = await sendTemplateMessage({
                  phoneNumberId: whatsappConfig.phone_number_id,
                  accessToken,
                  to: v,
                  templateName: appTemplate.name,
                  language: appTemplate.language || 'en_US',
                  template: appTemplate,
                  messageParams: { body: [customerName, reviewLink] },
                })
              } catch {
                waMsgId = await sendTextMessage({
                  phoneNumberId: whatsappConfig.phone_number_id,
                  accessToken,
                  to: v,
                  text: messageText,
                })
              }
            } else {
              waMsgId = await sendTextMessage({
                phoneNumberId: whatsappConfig.phone_number_id,
                accessToken,
                to: v,
                text: messageText,
              })
            }

            if (storedMessageId) {
              await supabase
                .from('messages')
                .update({ message_id: waMsgId.messageId })
                .eq('id', storedMessageId)
            }

            sentViaWhatsapp = true
            waErrorReason = null
            break
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            waErrorReason = msg
            console.error(`[staff/collect] Meta API send error for phone ${v}:`, msg)
            if (!isRecipientNotAllowedError(msg)) break
          }
        }
      } catch (waErr) {
        waErrorReason = waErr instanceof Error ? waErr.message : String(waErr)
        console.error('[staff/collect] WhatsApp error:', waErr)
      }
    }

    return NextResponse.json({
      success: true,
      data: reviewRequest,
      reviewLink,
      sentViaWhatsapp,
      waErrorReason,
    })
  } catch (error) {
    console.error('[reputation/staff/collect/POST] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
