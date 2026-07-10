'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

interface Payment {
  id: string
  user_id: string
  email: string
  name: string
  plan_tier: string
  plan_name: string
  amount: number
  utr_number: string
  screenshot_url: string
  status: string
  admin_notes: string
  created_at: string
  reviewed_at: string | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState<string | null>(null)

  const fetchPayments = async (status: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/payments?status=${status}`)
    if (res.ok) {
      setPayments(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments(filter)
  }, [filter])

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return
    setProcessing(paymentId)
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })
      if (res.ok) {
        fetchPayments(filter)
        setNotes('')
        setShowNotes(null)
      } else {
        const err = await res.json()
        alert(err.error || 'Action failed')
      }
    } catch {
      alert('Failed to process payment')
    } finally {
      setProcessing(null)
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
      info_requested: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ''}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Payment Verification</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve/reject manual UPI payments.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No {filter} payments found.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center text-base sm:text-lg font-bold text-primary shrink-0">
                    {payment.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{payment.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{payment.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-lg sm:text-xl font-bold text-foreground">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </span>
                  {statusBadge(payment.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-4 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block">Plan</span>
                  <span className="font-medium text-foreground">{payment.plan_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">UTR Number</span>
                  <span className="font-mono text-xs text-foreground">{payment.utr_number}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Date</span>
                  <span className="text-foreground">{new Date(payment.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Screenshot</span>
                  {payment.screenshot_url ? (
                    <a
                      href={payment.screenshot_url}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
              </div>

              {payment.status === 'pending' || payment.status === 'info_requested' ? (
                <div className="border-t border-border pt-4 mt-2">
                  {showNotes === payment.id && (
                    <div className="mb-3">
                      <textarea
                        placeholder="Add note or rejection reason..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setShowNotes(payment.id); setNotes('') }}
                      className="px-3 sm:px-4 py-2 rounded-lg border border-border text-xs sm:text-sm text-muted-foreground hover:bg-muted"
                    >
                      {showNotes === payment.id ? 'Cancel' : 'Add Note'}
                    </button>
                    <button
                      onClick={() => handleAction(payment.id, 'approve')}
                      disabled={processing === payment.id}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {processing === payment.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(payment.id, 'reject')}
                      disabled={processing === payment.id}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-red-600 text-white text-xs sm:text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {processing === payment.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                  {payment.admin_notes && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Previous note: {payment.admin_notes}
                    </p>
                  )}
                </div>
              ) : payment.admin_notes ? (
                <div className="border-t border-border pt-3 mt-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Admin note:</span> {payment.admin_notes}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
