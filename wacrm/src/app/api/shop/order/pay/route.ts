import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    const { order_id, payment_status } = await request.json();

    if (!order_id || payment_status !== 'paid') {
      return NextResponse.json({ error: 'Invalid order pay parameters.' }, { status: 400 });
    }

    const db = supabaseAdmin();

    // 1. Fetch order details
    const { data: order, error: fetchError } = await db
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Guard: Don't double pay
    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true, message: 'Order already marked as paid.' });
    }

    const accountId = order.account_id;

    // 2. Update Order Status
    const { error: orderUpdateError } = await db
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (orderUpdateError) {
      console.error('Failed to update order payment status:', orderUpdateError);
      return NextResponse.json({ error: 'Failed to confirm purchase payment.' }, { status: 500 });
    }

    // 3. Update associated Deal status to 'won'
    if (order.deal_id) {
      await db
        .from('deals')
        .update({
          status: 'won',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.deal_id);
    }

    // 4. Send Automated WhatsApp Receipt Confirmation
    let messageSent = false;
    let whatsappErrorMsg = '';

    try {
      // Fetch account's active WhatsApp Cloud API config
      const { data: config, error: configError } = await db
        .from('whatsapp_config')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'connected')
        .maybeSingle();

      if (!configError && config && config.phone_number_id && config.access_token) {
        const decryptedAccessToken = decrypt(config.access_token);

        // Fetch store config to get support number
        const { data: store } = await db
          .from('store_configs')
          .select('whatsapp_number')
          .eq('account_id', accountId)
          .maybeSingle();

        let supportText = '';
        if (store && store.whatsapp_number) {
          supportText = `\n\n📞 *Customer Support:*
For queries or updates, chat with support at wa.me/${store.whatsapp_number.replace(/[^0-9]/g, '')}`;
        }

        // Format items summary
        const itemsList = order.items as Array<{ name: string; quantity: number; sale_price: number }>;
        const itemsSummary = itemsList
          .map((item) => `• *${item.name}* x${item.quantity} (₹${item.sale_price})`)
          .join('\n');

        const shortOrderId = order_id.split('-')[0].toUpperCase();

        const messageText = `🛍️ *Order Confirmed!*

Hi *${order.customer_name}*, we have received your order *#${shortOrderId}* and payment of *₹${order.total_amount}* successfully.

📦 *Items Ordered:*
${itemsSummary}

📍 *Delivery Address:*
${order.delivery_address}${supportText}

Thank you for shopping with us! We will notify you once your package is dispatched.`;

        // Send message
        await sendTextMessage({
          phoneNumberId: config.phone_number_id,
          accessToken: decryptedAccessToken,
          to: order.customer_phone,
          text: messageText,
        });

        messageSent = true;
      } else {
        whatsappErrorMsg = 'WhatsApp Business config is disconnected or not configured.';
      }
    } catch (waErr: any) {
      console.error('Automated WhatsApp store receipt failed:', waErr);
      whatsappErrorMsg = waErr.message || 'WhatsApp sending error.';
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully.',
      whatsapp_sent: messageSent,
      whatsapp_error: whatsappErrorMsg || undefined,
    });

  } catch (err: any) {
    console.error('Order pay API error:', err);
    return NextResponse.json({ error: err.message || 'Payment confirmation failed internally.' }, { status: 500 });
  }
}
