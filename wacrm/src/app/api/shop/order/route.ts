import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findExistingContact } from '@/lib/contacts/dedupe';
import { normalizePhone } from '@/lib/whatsapp/phone-utils';
import { checkPlanLimit, checkStorefrontAccess } from '@/lib/billing/limits';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';

// Lazy-initialized to bypass build-time env check
let _adminClient: any = null;
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export async function POST(request: Request) {
  try {
    const { slug, customer_name, customer_phone, delivery_address, items, payment_method } = await request.json();

    if (!slug || !customer_name || !customer_phone || !delivery_address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order fields.' }, { status: 400 });
    }

    const db = supabaseAdmin();

    // 1. Fetch Store Config by slug
    const { data: store, error: storeError } = await db
      .from('store_configs')
      .select('*')
      .eq('slug', slug.trim().toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found or currently inactive.' }, { status: 404 });
    }

    const accountId = store.account_id;

    // 2. SaaS Gating Check: Subscription Active
    const hasAccess = await checkStorefrontAccess(accountId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'This store is temporarily unavailable (license expired).' }, { status: 403 });
    }

    // 3. SaaS Gating Check: Order Volume Limit
    const orderLimit = await checkPlanLimit(accountId, 'orders_per_month');
    if (!orderLimit.allowed) {
      return NextResponse.json({ 
        error: 'This business has reached its monthly order limits and cannot accept checkouts currently.' 
      }, { status: 429 });
    }

    // 4. Normalize phone number
    const normalizedPhone = normalizePhone(customer_phone);

    // 5. Get Owner User ID for audit FK inserts
    const { data: ownerProfile, error: ownerError } = await db
      .from('profiles')
      .select('user_id')
      .eq('account_id', accountId)
      .eq('account_role', 'owner')
      .limit(1)
      .maybeSingle();

    if (ownerError || !ownerProfile) {
      return NextResponse.json({ error: 'Store owner account error.' }, { status: 500 });
    }

    const ownerUserId = ownerProfile.user_id;

    // 6. Find or Create Contact
    const existingContact = await findExistingContact(db, accountId, normalizedPhone);
    let contactId: string;

    if (existingContact) {
      contactId = existingContact.id;
      if (customer_name && customer_name !== existingContact.name) {
        await db
          .from('contacts')
          .update({ name: customer_name, updated_at: new Date().toISOString() })
          .eq('id', contactId);
      }
    } else {
      // Create new contact
      const { data: newContact, error: contactCreateError } = await db
        .from('contacts')
        .insert({
          account_id: accountId,
          user_id: ownerUserId,
          phone: normalizedPhone,
          name: customer_name,
        })
        .select()
        .single();

      if (contactCreateError) {
        console.error('Error creating checkout contact:', contactCreateError);
        return NextResponse.json({ error: 'Failed to register customer contact.' }, { status: 500 });
      }
      contactId = newContact.id;
    }

    // 7. Calculate Pricing securely from DB (never trust client prices)
    const productIds = items.map((i: any) => i.product_id);
    const { data: dbProducts, error: dbProductsError } = await db
      .from('products')
      .select('*')
      .eq('account_id', accountId)
      .in('id', productIds);

    if (dbProductsError || !dbProducts) {
      return NextResponse.json({ error: 'Failed to retrieve catalog item prices.' }, { status: 500 });
    }

    let totalAmount = 0;
    const validatedItems = items.map((item: any) => {
      const dbProd = dbProducts.find((p: any) => p.id === item.product_id);
      if (!dbProd || !dbProd.is_available) {
        throw new Error(`Product ${item.name} is no longer available.`);
      }
      const price = Number(dbProd.sale_price);
      const qty = Number(item.quantity) || 1;
      totalAmount += price * qty;

      return {
        product_id: dbProd.id,
        name: dbProd.name,
        quantity: qty,
        regular_price: Number(dbProd.regular_price),
        sale_price: price,
      };
    });

    // 8. Fetch Currency Settings
    const { data: accountRow } = await db
      .from('accounts')
      .select('default_currency')
      .eq('id', accountId)
      .maybeSingle();

    const currency = accountRow?.default_currency || 'INR';

    // 9. Fetch First Pipeline and Stage
    const { data: pipeline } = await db
      .from('pipelines')
      .select('id')
      .eq('account_id', accountId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    let dealId = null;
    if (pipeline) {
      const { data: stage } = await db
        .from('pipeline_stages')
        .select('id')
        .eq('pipeline_id', pipeline.id)
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (stage) {
        // Insert CRM Deal
        const orderSummary = validatedItems.map(i => `${i.name} x${i.quantity}`).join(', ');
        const { data: newDeal, error: dealCreateError } = await db
          .from('deals')
          .insert({
            account_id: accountId,
            user_id: ownerUserId,
            pipeline_id: pipeline.id,
            stage_id: stage.id,
            contact_id: contactId,
            title: `Shop Order - ${customer_name}`,
            value: totalAmount,
            currency: currency,
            status: 'open',
            notes: `🛒 Items: ${orderSummary}\n📍 Address: ${delivery_address}\n📞 Phone: ${customer_phone}`,
          })
          .select()
          .single();

        if (!dealCreateError && newDeal) {
          dealId = newDeal.id;
        } else {
          console.error('Error creating checkout deal:', dealCreateError);
        }
      }
    }

    // 10. Insert Order Row
    const { data: newOrder, error: orderCreateError } = await db
      .from('orders')
      .insert({
        account_id: accountId,
        contact_id: contactId,
        customer_name,
        customer_phone: normalizedPhone,
        delivery_address,
        total_amount: totalAmount,
        payment_method: payment_method || 'cod',
        payment_status: 'pending',
        order_status: payment_method === 'cod' ? 'confirmed' : 'pending',
        items: validatedItems,
        deal_id: dealId,
      })
      .select()
      .single();

    if (orderCreateError || !newOrder) {
      console.error('Error creating database order:', orderCreateError);
      return NextResponse.json({ error: 'Failed to record store purchase order.' }, { status: 500 });
    }

    // 11. Send automated WhatsApp confirmation for Cash on Delivery (COD) immediately
    if (payment_method === 'cod') {
      try {
        const { data: config } = await db
          .from('whatsapp_config')
          .select('*')
          .eq('account_id', accountId)
          .eq('status', 'connected')
          .maybeSingle();

        if (config && config.phone_number_id && config.access_token) {
          const decryptedAccessToken = decrypt(config.access_token);
          const itemsSummary = validatedItems
            .map((item) => `• *${item.name}* x${item.quantity} (₹${item.sale_price})`)
            .join('\n');
          const shortOrderId = newOrder.id.split('-')[0].toUpperCase();

          let supportText = '';
          if (store.whatsapp_number) {
            supportText = `\n\n📞 *Customer Support:*
For queries or updates, chat with support at wa.me/${store.whatsapp_number.replace(/[^0-9]/g, '')}`;
          }

          const messageText = `🛍️ *Order Confirmed!*

Hi *${customer_name}*, we have received your order *#${shortOrderId}* of *₹${totalAmount}* (Cash on Delivery) successfully.

📦 *Items Ordered:*
${itemsSummary}

📍 *Delivery Address:*
${delivery_address}${supportText}

Thank you for shopping with us! We will notify you once your package is dispatched.`;

          await sendTextMessage({
            phoneNumberId: config.phone_number_id,
            accessToken: decryptedAccessToken,
            to: normalizedPhone,
            text: messageText,
          });
        }
      } catch (waErr) {
        console.error('COD automated WhatsApp confirmation failed:', waErr);
      }
    }

    return NextResponse.json({
      order_id: newOrder.id,
      total_amount: totalAmount,
      currency: currency,
      upi_id: store.upi_id || '',
      whatsapp_number: store.whatsapp_number || '',
      store_name: store.name,
    });

  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed internally.' }, { status: 500 });
  }
}
