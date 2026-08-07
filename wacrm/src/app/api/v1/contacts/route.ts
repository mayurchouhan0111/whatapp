// ============================================================
// Public API: /api/v1/contacts
//
// Allows machine-to-machine creation and listing of contacts.
// Authenticated with Bearer wacrm_live_… API key.
// ============================================================

import { requireApiKey } from '@/lib/auth/api-context';
import { ok, badRequest, toApiErrorResponse } from '@/lib/api/v1/respond';
import { findExistingContact } from '@/lib/contacts/dedupe';
import { normalizePhone } from '@/lib/whatsapp/phone-utils';

export async function GET(request: Request) {
  try {
    const ctx = await requireApiKey(request, 'contacts:read');
    const { data, error } = await ctx.supabase
      .from('contacts')
      .select('*')
      .eq('account_id', ctx.accountId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return ok(data || []);
  } catch (err) {
    return toApiErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireApiKey(request, 'contacts:write');
    const body = await request.json();

    const { name, phone, email, tags, custom_fields } = body;

    if (!phone) {
      throw badRequest('phone number is required');
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw badRequest('Invalid phone number format');
    }

    // Check if contact already exists
    const existing = await findExistingContact(
      ctx.supabase,
      ctx.accountId,
      normalizedPhone
    );

    if (existing) {
      return ok({
        contact: existing,
        created: false,
        message: 'Contact already exists in account',
      });
    }

    // Create new contact
    const { data: newContact, error: insertError } = await ctx.supabase
      .from('contacts')
      .insert({
        account_id: ctx.accountId,
        name: name || normalizedPhone,
        phone: normalizedPhone,
        email: email || null,
        user_id: ctx.createdBy,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Attach tags if provided
    if (Array.isArray(tags) && tags.length > 0 && newContact) {
      for (const tagName of tags) {
        if (typeof tagName !== 'string' || !tagName.trim()) continue;

        // Upsert tag row
        const { data: tagRow } = await ctx.supabase
          .from('tags')
          .upsert(
            { account_id: ctx.accountId, name: tagName.trim() },
            { onConflict: 'account_id,name' }
          )
          .select('id')
          .single();

        if (tagRow) {
          await ctx.supabase
            .from('contact_tags')
            .insert({ contact_id: newContact.id, tag_id: tagRow.id })
            .maybeSingle();
        }
      }
    }

    return ok({
      contact: newContact,
      created: true,
    });
  } catch (err) {
    return toApiErrorResponse(err);
  }
}
