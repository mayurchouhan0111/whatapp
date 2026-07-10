'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Clock, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'info_requested'

interface PaymentData {
  id: string
  status: PaymentStatus
  admin_notes: string
  plan_name: string
  amount: number
  utr_number: string
  created_at: string
}

export default function PaymentStatusPage() {
  const params = useParams()
  const paymentId = params.id as string

  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}/status`)
        if (res.ok) {
          const data = await res.json()
          setPayment(data)
          if (data.status === 'approved' || data.status === 'rejected') {
            return
          }
        }
      } catch {} finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [paymentId])

  useEffect(() => {
    if (!payment || payment.status !== 'pending') return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [payment?.status])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Payment not found</h2>
          <Link href="/pricing" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Pricing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
          {payment.status === 'pending' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                <Clock className="h-10 w-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Pending</h2>
              <p className="text-muted-foreground mb-6">
                Your payment for <strong>{payment.plan_name}</strong> (₹{payment.amount.toLocaleString('en-IN')}) is being verified.
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-3xl font-mono font-bold text-foreground">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Your payment is being verified by our team. Please wait.
                  {timeLeft === 0 && (
                    <> If verification takes longer, the page will auto-update when status changes.</>
                  )}
                </p>
              </div>

              <div className="mt-6 text-xs text-muted-foreground space-y-1">
                <p>UTR: {payment.utr_number}</p>
                <p>Requested: {new Date(payment.created_at).toLocaleString()}</p>
              </div>
            </>
          )}

          {payment.status === 'approved' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your <strong>{payment.plan_name}</strong> subscription is now active.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {payment.status === 'rejected' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Not Verified</h2>
              {payment.admin_notes && (
                <p className="text-muted-foreground mb-2">
                  Reason: {payment.admin_notes}
                </p>
              )}
              <p className="text-muted-foreground mb-6">
                We could not verify your payment. Please try again.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
              >
                Try Again
              </Link>
            </>
          )}

          {payment.status === 'info_requested' && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Additional Information Needed</h2>
              {payment.admin_notes && (
                <p className="text-muted-foreground mb-6">
                  {payment.admin_notes}
                </p>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
              >
                Contact Support
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
