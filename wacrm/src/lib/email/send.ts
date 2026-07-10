import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

let _resend: Resend | null = null
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to)
    return
  }
  try {
    const result = await resend.emails.send({
      from: `Vbuild CRM <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log('[email] sent successfully to', to, 'id:', result.id)
  } catch (err) {
    console.error('[email] send failed to', to, ':', err)
  }
}

export function notifyAdminNewPayment(payment: {
  name: string
  email: string
  plan_name: string
  amount: number
  utr_number: string
  screenshot_url?: string
  payment_id: string
}) {
  if (!ADMIN_EMAIL) {
    console.warn('[email] ADMIN_EMAIL not set — skipping admin notification')
    return
  }
  const screenshotHtml = payment.screenshot_url
    ? `<p><strong>Screenshot:</strong> <a href="${payment.screenshot_url}" target="_blank">View Screenshot</a></p>`
    : ''

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Payment Received – ${payment.name} (${payment.plan_name})`,
    html: `
      <h2>New Payment Verification Request</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr><td style="padding:8px;font-weight:bold;">Name</td><td style="padding:8px;">${payment.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${payment.email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Plan</td><td style="padding:8px;">${payment.plan_name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Amount</td><td style="padding:8px;">₹${payment.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">UTR</td><td style="padding:8px;">${payment.utr_number}</td></tr>
        ${screenshotHtml}
        <tr><td colspan="2" style="padding:12px 8px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://vbuild-automation.netlify.app'}/admin/payments"
             style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;">
            Review in Admin Panel
          </a>
        </td></tr>
      </table>
    `,
  })
}

export function notifyPaymentApproved(user: { email: string; name: string; plan_name: string }) {
  return sendEmail({
    to: user.email,
    subject: `Your ${user.plan_name} subscription is now active!`,
    html: `
      <h2>Payment Approved!</h2>
      <p>Hi ${user.name},</p>
      <p>Your payment for the <strong>${user.plan_name}</strong> plan has been verified and your subscription is now active.</p>
      <p>You can start using all the features of your plan right away.</p>
      <p style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://vbuild-automation.netlify.app'}/dashboard"
           style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;">
          Go to Dashboard
        </a>
      </p>
    `,
  })
}

export function notifyPaymentRejected(user: { email: string; name: string; plan_name: string; reason: string }) {
  return sendEmail({
    to: user.email,
    subject: `Your ${user.plan_name} payment could not be verified`,
    html: `
      <h2>Payment Verification Failed</h2>
      <p>Hi ${user.name},</p>
      <p>We were unable to verify your payment for the <strong>${user.plan_name}</strong> plan.</p>
      ${user.reason ? `<p><strong>Reason:</strong> ${user.reason}</p>` : ''}
      <p>Please try again or contact our support team if you believe this is a mistake.</p>
      <p style="margin-top:24px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://vbuild-automation.netlify.app'}/pricing"
           style="display:inline-block;padding:10px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;">
          Try Again
        </a>
      </p>
    `,
  })
}
