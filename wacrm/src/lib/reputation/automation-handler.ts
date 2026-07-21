import { supabaseAdmin } from '@/lib/flows/admin-client'
import { sendTextMessage } from '@/lib/whatsapp/meta-api'
import { decrypt } from '@/lib/whatsapp/encryption'
import { sanitizePhoneForMeta, isValidE164 } from '@/lib/whatsapp/phone-utils'

interface ReviewEvent {
  accountId: string
  contactId: string
  contactPhone: string
  rating: number
  spinReward?: string
  discountCode?: string
}

export async function handlePostReviewAutomation(event: ReviewEvent) {
  const db = supabaseAdmin()

  const { data: settings } = await db
    .from('reputation_settings')
    .select('*')
    .eq('account_id', event.accountId)
    .single()

  if (!settings) return

  const { data: whatsappConfig } = await db
    .from('whatsapp_config')
    .select('*')
    .eq('account_id', event.accountId)
    .single()

  if (!whatsappConfig) return

  const { data: account } = await db
    .from('accounts')
    .select('name')
    .eq('id', event.accountId)
    .single()

  const businessName = account?.name || 'our business'
  const accessToken = decrypt(whatsappConfig.access_token)
  const sanitizedPhone = sanitizePhoneForMeta(event.contactPhone)

  if (!isValidE164(sanitizedPhone)) return

  if (event.rating >= 4) {
    let thankYouMessage = `Thank you for your wonderful review! 🌟 We're thrilled you enjoyed your experience at ${businessName}.`

    if (event.discountCode) {
      thankYouMessage += `\n\n🎉 Here's a special reward for you: **${event.discountCode}**\nShow this code on your next visit to redeem!`
    }

    if (event.spinReward) {
      thankYouMessage += `\n\n🎁 You won: ${event.spinReward}!`
    }

    thankYouMessage += `\n\nWe look forward to serving you again soon! 🙏`

    try {
      await sendTextMessage({
        phoneNumberId: whatsappConfig.phone_number_id,
        accessToken,
        to: sanitizedPhone,
        text: thankYouMessage,
      })
    } catch (err) {
      console.error('[automation-handler] failed to send thank you:', err)
    }

    // Send interactive sales menu for high ratings
    try {
      const menuMessage = `👉 *Want to explore more?*\n\nReply with:\n1️⃣ Book a Table\n2️⃣ View Digital Menu\n3️⃣ Order Online`
      await sendTextMessage({
        phoneNumberId: whatsappConfig.phone_number_id,
        accessToken,
        to: sanitizedPhone,
        text: menuMessage,
      })
    } catch {
      // Non-critical
    }
  } else {
    let recoveryMessage = `We're sorry your experience at ${businessName} didn't meet expectations. 😔 We take your feedback seriously and would love to make things right.`

    if (event.rating <= 2) {
      recoveryMessage += `\n\nA manager will reach out to you shortly to personally address your concerns.`
    }

    try {
      await sendTextMessage({
        phoneNumberId: whatsappConfig.phone_number_id,
        accessToken,
        to: sanitizedPhone,
        text: recoveryMessage,
      })
    } catch (err) {
      console.error('[automation-handler] failed to send recovery:', err)
    }
  }
}
