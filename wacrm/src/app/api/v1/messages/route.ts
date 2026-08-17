// ============================================================
// Public API: /api/v1/messages
//
// Machine-to-machine WhatsApp message dispatch.
// Authenticated with Bearer wacrm_live_… API key.
// Scope required: messages:send
// ============================================================

import { requireApiKey } from '@/lib/auth/api-context';
import { ok, badRequest, toApiErrorResponse } from '@/lib/api/v1/respond';
import { sendTextMessage, sendTemplateMessage } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';
import { normalizePhone, sanitizePhoneForMeta } from '@/lib/whatsapp/phone-utils';
import { findExistingContact } from '@/lib/contacts/dedupe';

export async function POST(request: Request) {
  try {
    const ctx = await requireApiKey(request, 'messages:send');
    const body = await request.json();

    const {
      to,
      phone,
      content_text,
      text,
      message_type = 'text',
      template_name,
      template_language = 'en_US',
    } = body;

    const targetPhone = to || phone;
    const messageContent = content_text || text;

    if (!targetPhone) {
      throw badRequest('"to" or "phone" recipient is required');
    }

    const normalizedPhone = normalizePhone(targetPhone);
    if (!normalizedPhone) {
      throw badRequest('Invalid phone number format');
    }

    if (message_type === 'text' && !messageContent) {
      throw badRequest('"content_text" or "text" is required for text messages');
    }

    if (message_type === 'template' && !template_name) {
      throw badRequest('"template_name" is required for template messages');
    }

    if (message_type === 'template' && template_name) {
      const lowerName = template_name.toLowerCase();
      if (lowerName === 'hello_world' || lowerName.startsWith('jaspers_market_')) {
        throw badRequest('Meta sample templates (hello_world, jaspers_market_*) are restricted by Meta to test numbers only. Please use your custom approved template.');
      }
    }

    // 1. Fetch WhatsApp config for this account
    const { data: config, error: configError } = await ctx.supabase
      .from('whatsapp_config')
      .select('*')
      .eq('account_id', ctx.accountId)
      .single();

    if (configError || !config) {
      throw badRequest('WhatsApp Business API is not configured for this account.');
    }

    const accessToken = decrypt(config.access_token);
    const sanitizedPhone = sanitizePhoneForMeta(normalizedPhone);

    // 2. Dispatch message to Meta Cloud API
    let waMessageId = '';
    if (message_type === 'template') {
      const result = await sendTemplateMessage({
        phoneNumberId: config.phone_number_id,
        accessToken,
        to: sanitizedPhone,
        templateName: template_name,
        language: template_language,
      });
      waMessageId = result.messageId;
    } else {
      const result = await sendTextMessage({
        phoneNumberId: config.phone_number_id,
        accessToken,
        to: sanitizedPhone,
        text: messageContent,
      });
      waMessageId = result.messageId;
    }

    // 3. Find or create contact in account
    let contact = await findExistingContact(
      ctx.supabase,
      ctx.accountId,
      normalizedPhone
    );

    if (!contact) {
      const { data: newContact } = await ctx.supabase
        .from('contacts')
        .insert({
          account_id: ctx.accountId,
          user_id: ctx.createdBy,
          name: normalizedPhone,
          phone: normalizedPhone,
        })
        .select()
        .single();
      contact = newContact;
    }

    if (!contact) {
      throw badRequest('Failed to resolve or create contact for conversation.');
    }

    // 4. Find or create conversation in account
    let { data: conversation } = await ctx.supabase
      .from('conversations')
      .select('id')
      .eq('account_id', ctx.accountId)
      .eq('contact_id', contact.id)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv } = await ctx.supabase
        .from('conversations')
        .insert({
          account_id: ctx.accountId,
          contact_id: contact.id,
          user_id: ctx.createdBy,
          last_message_text: messageContent || `[${message_type}]`,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();
      conversation = newConv;
    }

    if (!conversation) {
      throw badRequest('Failed to resolve conversation.');
    }

    // 5. Insert message into DB via service role (bypasses RLS)
    const { data: msgRecord, error: msgError } = await ctx.supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'agent',
        content_type: message_type,
        content_text: messageContent || null,
        template_name: template_name || null,
        message_id: waMessageId,
        status: 'sent',
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error recording sent message to DB:', msgError);
    }

    // 6. Update conversation timestamp
    await ctx.supabase
      .from('conversations')
      .update({
        last_message_text: messageContent || `[${message_type}]`,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    return ok({
      success: true,
      whatsapp_message_id: waMessageId,
      message_id: msgRecord?.id || null,
      contact_id: contact.id,
      conversation_id: conversation.id,
    });
  } catch (err) {
    return toApiErrorResponse(err);
  }
}
