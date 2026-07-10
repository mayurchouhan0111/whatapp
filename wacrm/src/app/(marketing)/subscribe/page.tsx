'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, Copy, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SubscribePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SubscribePage />
    </Suspense>
  )
}

const PLANS: Record<string, { name: string; price: number; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: 999,
    features: ['3 Team Members', '2,500 Contacts', '1,000 Broadcasts/mo', '2 Pipelines', '1 Active Flow', 'Store (50 Products)'],
  },
  growth: {
    name: 'Growth',
    price: 1999,
    features: ['10 Team Members', '15,000 Contacts', '10,000 Broadcasts/mo', '5 Pipelines', '10 Active Flows', 'Store (500 Products)', 'API Access'],
  },
  pro: {
    name: 'Pro',
    price: 3999,
    features: ['25 Team Members', '50,000 Contacts', '50,000 Broadcasts/mo', 'Unlimited Pipelines', 'Unlimited Flows', 'Store (2500 Products)', 'Full API Access'],
  },
}

function SubscribePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planSlug = searchParams.get('plan') || 'starter'
  const plan = PLANS[planSlug]

  const [upiSettings, setUpiSettings] = useState<{ upi_id: string; account_name: string; qr_image_url: string } | null>(null)
  const [utrNumber, setUtrNumber] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/public/upi-settings')
      .then((r) => r.json())
      .then(setUpiSettings)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!utrNumber.trim()) {
      setError('Please enter the UTR number')
      return
    }
    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.append('plan_tier', planSlug)
    formData.append('utr_number', utrNumber.trim())
    if (screenshot) formData.append('screenshot', screenshot)

    const res = await fetch('/api/payments/upi/submit', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/payment/${data.payment_id}/status`)
    } else {
      const err = await res.json()
      setError(err.error || 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Plan not found</h2>
          <p className="text-muted-foreground mt-2">The selected plan does not exist.</p>
          <Link href="/pricing" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Pricing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Pricing
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Plan details */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">{plan.name} Plan</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-foreground">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment form */}
            <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-border bg-card p-8 shadow-sm space-y-5">
              <h3 className="text-lg font-semibold text-foreground">Confirm Payment</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">UTR Number / Transaction ID</label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter the UTR number from your payment"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Screenshot (optional)</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                  <Upload className="h-5 w-5" />
                  {screenshot ? screenshot.name : 'Upload screenshot'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  "I've Paid — Verify Now"
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Your payment will be verified by our team. You'll get access once confirmed.
              </p>
            </form>
          </div>

          {/* Right: UPI QR */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-foreground mb-4">Pay with UPI</h3>

              {upiSettings?.qr_image_url ? (
                <div className="flex justify-center mb-6">
                  <img
                    src={upiSettings.qr_image_url}
                    alt="UPI QR Code"
                    className="w-64 h-64 object-contain rounded-xl border border-border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 rounded-xl bg-muted/30 border border-dashed border-border mb-6">
                  <p className="text-sm text-muted-foreground">QR code not configured yet</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">₹{plan.price.toLocaleString('en-IN')}</span>
                </div>
                {upiSettings?.upi_id && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">UPI ID</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(upiSettings.upi_id); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                    >
                      {upiSettings.upi_id}
                      <Copy className="h-3 w-3" />
                      {copied && <span className="text-emerald-400">Copied!</span>}
                    </button>
                  </div>
                )}
                {upiSettings?.account_name && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Account</span>
                    <span className="font-medium text-foreground">{upiSettings.account_name}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-200">
                  <strong>Steps:</strong>
                </p>
                <ol className="mt-2 text-xs text-amber-200/80 space-y-1 list-decimal list-inside">
                  <li>Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                  <li>Scan the QR code or enter the UPI ID</li>
                  <li>Pay the exact amount shown</li>
                  <li>Copy the UTR number and paste it in the form</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
