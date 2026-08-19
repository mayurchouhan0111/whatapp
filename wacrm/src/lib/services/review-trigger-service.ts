import { supabaseAdmin } from '@/lib/flows/admin-client';
import { sendTemplateMessage } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sanitizePhoneForMeta, isValidE164 } from '@/lib/whatsapp/phone-utils';
import { isMessageTemplate } from '@/lib/whatsapp/template-row-guard';

export interface TriggerReviewOptions {
  accountId: string;
  contactId: string;
  contactName?: string;
  contactPhone: string;
  staffId?: string;
  tableNumber?: string;
  sourceType?: 'auto_contact_created' | 'manual' | 'qr_scan' | 'pipeline_stage' | 'batch_campaign';
}

/**
 * Triggers an automated WhatsApp Review Request to a contact if reputation settings allow.
 */
export async function triggerContactReviewRequest(options: TriggerReviewOptions) {
  const db = supabaseAdmin();
  const { accountId, contactId, contactName, contactPhone, staffId, tableNumber, sourceType = 'manual' } = options;

  if (!contactPhone) return { success: false, reason: 'No contact phone number provided' };

  // 1. Fetch reputation settings
  const { data: settings } = await db
    .from('reputation_settings')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle();

  if (!settings) {
    return { success: false, reason: 'Reputation settings not configured' };
  }

  // 2. Create a review request entry in DB
  const { data: request, error: reqErr } = await db
    .from('review_requests')
    .insert({
      account_id: accountId,
      contact_id: contactId,
      status: 'sent',
      sent_at: new Date().toISOString(),
      staff_id: staffId || null,
      table_number: tableNumber || null,
      source_type: sourceType,
    })
    .select()
    .single();

  if (reqErr || !request) {
    console.error('[review-trigger-service] Failed to create review request record:', reqErr);
    return { success: false, reason: 'Database error creating review request' };
  }

  // Build the review URL
  // Domain can be from env or default app host
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const reviewLink = `${appUrl}/r/${request.id}`;

  // 4. Fetch WhatsApp config for Meta API
  const { data: whatsappConfig } = await db
    .from('whatsapp_config')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle();

  if (!whatsappConfig || !whatsappConfig.access_token || !whatsappConfig.phone_number_id) {
    return { success: true, requestId: request.id, reviewLink, warning: 'WhatsApp API not configured for account. Review link created.' };
  }

  const sanitizedPhone = sanitizePhoneForMeta(contactPhone);
  if (!isValidE164(sanitizedPhone)) {
    return { success: false, reason: 'Invalid phone number format for WhatsApp' };
  }

  // 5. Send via an approved review template. Meta only allows
  // business-initiated messages (to new or 24h-window-expired contacts)
  // when they use an approved message template — free-form text is
  // rejected outside the 24h customer-service window. Find the account's
  // approved review template (excluding Meta sample templates) and send
  // through it; surface a clear error if none exists.
  const { data: appTemplate } = await db
    .from('message_templates')
    .select('*')
    .eq('account_id', accountId)
    .eq('status', 'APPROVED')
    .neq('name', 'hello_world')
    .ilike('name', '%review%')
    .limit(1)
    .maybeSingle()

  try {
    const accessToken = decrypt(whatsappConfig.access_token);

    if (!appTemplate || !isMessageTemplate(appTemplate)) {
      throw new Error(
        'No approved review template found. Create a review template in Settings → Templates and wait for Meta to approve it, then retry.',
      );
    }

    const result = await sendTemplateMessage({
      phoneNumberId: whatsappConfig.phone_number_id,
      accessToken,
      to: sanitizedPhone,
      templateName: appTemplate.name,
      language: appTemplate.language || 'en_US',
      template: appTemplate,
      messageParams: { body: [contactName || 'there', reviewLink] },
    });

    return {
      success: true,
      requestId: request.id,
      reviewLink,
      phoneSent: sanitizedPhone,
      messageId: result.messageId,
    };
  } catch (err) {
    console.error('[review-trigger-service] Failed to send WhatsApp message:', err);
    await db.from('review_requests').update({ status: 'failed' }).eq('id', request.id);
    return { success: false, reason: err instanceof Error ? err.message : 'Failed to send WhatsApp message' };
  }
}
