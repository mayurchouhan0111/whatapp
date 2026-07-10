import nodemailer from 'nodemailer'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''

const FROM_NAME = process.env.FROM_NAME || 'Vbuild CRM'
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER

let _transporter: nodemailer.Transporter | null = null
let _transporterVerified = false

function getTransporter() {
  if (!_transporter && SMTP_USER && SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return _transporter
}

async function verifyTransporter() {
  const transporter = getTransporter()
  if (!transporter || _transporterVerified) return true
  try {
    await transporter.verify()
    _transporterVerified = true
    console.log('[email] SMTP connection verified')
    return true
  } catch (err) {
    console.error('[email] SMTP connection failed:', err)
    return false
  }
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
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP_USER/SMTP_PASS not set — skipping email to', to)
    return
  }
  await verifyTransporter()
  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log('[email] sent successfully to', to, 'id:', info.messageId)
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
