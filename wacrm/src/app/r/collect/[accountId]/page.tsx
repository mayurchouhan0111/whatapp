'use client'

import { use, useEffect, useState, Suspense } from 'react'
import {
  Send, Phone, User, Table as TableIcon, CheckCircle2,
  Copy, Sparkles, Loader2, UtensilsCrossed, AlertCircle, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function PublicCollectorContent({ accountId }: { accountId: string }) {
  const [businessName, setBusinessName] = useState('Restaurant')
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [lastSentLink, setLastSentLink] = useState<string | null>(null)
  const [lastSentPhone, setLastSentPhone] = useState('')
  const [lastSentName, setLastSentName] = useState('')
  const [sentViaWa, setSentViaWa] = useState(false)
  const [waReason, setWaReason] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!accountId) return

    fetch(`/api/public/reputation/staff/collect?accountId=${accountId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Restaurant account not found.')
        return res.json()
      })
      .then((payload) => {
        setBusinessName(payload.data.businessName || 'Restaurant')
        const staff = payload.data.staff || []
        setStaffList(staff)

        // Restore previously selected staff member on waiter's phone
        const savedId = localStorage.getItem(`waiter_staff_${accountId}`)
        if (savedId && staff.some((s: any) => s.id === savedId)) {
          setSelectedStaffId(savedId)
        } else if (staff.length > 0) {
          setSelectedStaffId(staff[0].id)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load restaurant details.')
        setLoading(false)
      })
  }, [accountId])

  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id)
    localStorage.setItem(`waiter_staff_${accountId}`, id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerPhone.trim() || submitting) return

    setSubmitting(true)
    setLastSentLink(null)
    const phoneToSubmit = customerPhone.trim()
    const nameToSubmit = customerName.trim()

    try {
      const res = await fetch('/api/public/reputation/staff/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          phone: phoneToSubmit,
          name: nameToSubmit || undefined,
          tableNumber: tableNumber.trim() || undefined,
          staffId: selectedStaffId || undefined,
        }),
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed to send request.')

      setLastSentLink(payload.reviewLink)
      setLastSentPhone(phoneToSubmit)
      setLastSentName(nameToSubmit)
      setSentViaWa(payload.sentViaWhatsapp)
      setWaReason(payload.waErrorReason || null)

      // Clear phone & table for next customer
      setCustomerPhone('')
      setCustomerName('')
      setTableNumber('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error submitting request.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading Waiter Terminal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold text-foreground">Invalid Restaurant Link</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  const activeStaff = staffList.find((s) => s.id === selectedStaffId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{businessName}</h1>
          <p className="text-xs text-muted-foreground">Waiter Mobile Terminal — Table Review Collector</p>
        </div>

        {/* Main Card */}
        <Card className="border-amber-500/30 shadow-xl backdrop-blur-md">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">Customer Contact Entry</CardTitle>
                <CardDescription className="text-xs">Collect phone number after meal</CardDescription>
              </div>

              {/* Staff Switcher Dropdown */}
              <div className="text-right">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Logged Waiter</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="h-8 rounded-lg border border-amber-500/40 bg-muted/40 px-2 text-xs font-bold outline-none text-foreground cursor-pointer"
                >
                  {staffList.length === 0 ? (
                    <option value="">Default Staff</option>
                  ) : (
                    staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        👤 {s.name} ({s.role})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-2 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Customer Phone Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-amber-500" /> Customer Mobile Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="h-12 text-base font-bold tracking-wide rounded-xl border-border bg-background focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Name (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Rahul"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                {/* Table Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <TableIcon className="h-3.5 w-3.5 text-muted-foreground" /> Table #
                  </label>
                  <Input
                    placeholder="e.g. T-04"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="h-10 text-xs font-bold rounded-xl"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !customerPhone.trim()}
                className="w-full h-12 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] mt-2"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Instant Review & Spin Reward</>
                )}
              </Button>
            </form>

            {/* Success Result Box */}
            {lastSentLink && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-2.5 animate-scale-in">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    {sentViaWa ? 'Sent Automatically via WhatsApp Meta API!' : 'Contact Added & Review Link Ready!'}
                  </div>
                  {!sentViaWa && waReason && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium px-2">
                      Note: {waReason} Use the WhatsApp button below to send directly!
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground font-mono break-all bg-background/60 p-2 rounded-lg border border-border/40">
                  {lastSentLink}
                </p>

                {/* 1-Tap Send via WhatsApp Button */}
                <a
                  href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(
                    lastSentPhone ? lastSentPhone.replace(/\D/g, '') : ''
                  )}&text=${encodeURIComponent(
                    `Hi ${lastSentName || 'there'}, thank you for dining with us at ${businessName}! We value your feedback. Please click here to rate your experience and spin the wheel for rewards: ${lastSentLink}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-md transition-all decoration-none"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Instant WhatsApp Message
                </a>

                <div className="flex justify-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => copyToClipboard(lastSentLink)}
                    className="text-xs font-bold gap-1 flex-1"
                  >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => window.open(lastSentLink, '_blank')}
                    className="text-xs font-bold gap-1 flex-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Preview
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        {activeStaff && (
          <p className="text-[11px] text-center text-muted-foreground">
            Attributed to waiter: <strong className="text-foreground">{activeStaff.name}</strong> ({activeStaff.role})
          </p>
        )}
      </div>
    </div>
  )
}

export default function PublicCollectorPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params)

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      }
    >
      <PublicCollectorContent accountId={accountId} />
    </Suspense>
  )
}
