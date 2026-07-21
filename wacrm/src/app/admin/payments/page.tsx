'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, Banknote, AlertCircle } from 'lucide-react'

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

const FILTERS = ['pending', 'approved', 'rejected'] as const

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  info_requested: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('pending')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)

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
        setConfirmId(null)
        setConfirmAction(null)
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

  const startConfirm = (id: string, action: 'approve' | 'reject') => {
    setConfirmId(id)
    setConfirmAction(action)
  }

  const cancelConfirm = () => {
    setConfirmId(null)
    setConfirmAction(null)
  }

  const statusBadge = (status: string) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  )


  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve or reject manual UPI payments.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-0">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`relative px-4 pb-3 pt-2 text-sm font-medium transition-colors ${
              filter === s
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-muted-foreground">Loading payments...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Banknote className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium">No {filter} payments</p>
          <p className="text-sm text-muted-foreground/60 mt-1">All caught up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const isPending = payment.status === 'pending' || payment.status === 'info_requested'
            const showConfirm = confirmId === payment.id

            return (
              <div
                key={payment.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary shrink-0">
                        {payment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">{payment.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{payment.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xl font-bold text-foreground">
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </span>
                      {statusBadge(payment.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="font-medium text-foreground">{payment.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">UTR</p>
                      <p className="font-mono text-xs text-foreground">{payment.utr_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-foreground text-xs">{new Date(payment.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Screenshot</p>
                      {payment.screenshot_url ? (
                        <a
                          href={payment.screenshot_url}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">Not provided</span>
                      )}
                    </div>
                  </div>

                  {isPending ? (
                    <div className="border-t border-border pt-4 mt-2">
                      {showNotes === payment.id && (
                        <div className="mb-3">
                          <textarea
                            placeholder="Add a note or rejection reason..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                      )}

                      {showConfirm ? (
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {confirmAction === 'approve' ? 'Approve this payment?' : 'Reject this payment?'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {confirmAction === 'approve'
                                  ? 'The user will be notified and their subscription will be activated.'
                                  : 'The user will be notified with your note above.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelConfirm}
                              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAction(payment.id, confirmAction!)}
                              disabled={processing === payment.id}
                              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                                confirmAction === 'approve'
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              {processing === payment.id ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  {confirmAction === 'approve' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                  Confirm {confirmAction === 'approve' ? 'Approve' : 'Reject'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => { setShowNotes(showNotes === payment.id ? null : payment.id); setNotes('') }}
                            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                          >
                            {showNotes === payment.id ? 'Cancel' : 'Add Note'}
                          </button>
                          <button
                            onClick={() => startConfirm(payment.id, 'approve')}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => { setNotes(''); startConfirm(payment.id, 'reject') }}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      {payment.admin_notes && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          <span className="font-medium">Previous note:</span> {payment.admin_notes}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
