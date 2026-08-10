'use client'

import { useEffect, useState } from 'react'
import {
  Send, Phone, User, Table as TableIcon, CheckCircle2,
  Copy, Sparkles, Loader2, UtensilsCrossed, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function StaffTableCollectorPage() {
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string }[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)

  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [lastSentLink, setLastSentLink] = useState<string | null>(null)
  const [sentViaWa, setSentViaWa] = useState(false)

  // 1. Fetch staff list & load saved waiter ID from localStorage
  useEffect(() => {
    fetch('/api/reputation/staff')
      .then((res) => res.json())
      .then((payload) => {
        const staff = payload.data || []
        setStaffList(staff)

        // Restore previously selected staff member on this phone
        const savedId = localStorage.getItem('table_waiter_id')
        if (savedId && staff.some((s: any) => s.id === savedId)) {
          setSelectedStaffId(savedId)
        } else if (staff.length > 0) {
          setSelectedStaffId(staff[0].id)
        }
      })
      .catch(() => toast.error('Failed to load staff list.'))
      .finally(() => setLoadingStaff(false))
  }, [])

  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id)
    localStorage.setItem('table_waiter_id', id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerPhone.trim()) {
      toast.error('Please enter customer phone number.')
      return
    }

    setSubmitting(true)
    setLastSentLink(null)

    try {
      const res = await fetch('/api/reputation/staff/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerPhone.trim(),
          name: customerName.trim() || undefined,
          table_number: tableNumber.trim() || undefined,
          staff_id: selectedStaffId || undefined,
        }),
      })

      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed to send request.')

      toast.success(payload.sentViaWhatsapp ? 'Sent via WhatsApp to customer!' : 'Review link generated!')
      setLastSentLink(payload.reviewLink)
      setSentViaWa(payload.sentViaWhatsapp)

      // Reset form inputs for next customer table
      setCustomerPhone('')
      setCustomerName('')
      setTableNumber('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error submitting request.')
    } finally {
      setSubmitting(false)
    }
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
          <h1 className="text-2xl font-black tracking-tight text-foreground">Waiter Table Terminal</h1>
          <p className="text-xs text-muted-foreground">Quick Table-Side Review Collector & Reward Generator</p>
        </div>

        {/* Main Card */}
        <Card className="border-amber-500/30 shadow-xl backdrop-blur-md">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground">New Table Customer</CardTitle>
                <CardDescription className="text-xs">Collect phone number after meal</CardDescription>
              </div>

              {/* Staff Switcher Dropdown */}
              <div className="text-right">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Logged Staff</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  disabled={loadingStaff}
                  className="h-8 rounded-lg border border-amber-500/40 bg-muted/40 px-2 text-xs font-bold outline-none text-foreground cursor-pointer"
                >
                  {loadingStaff ? (
                    <option>Loading...</option>
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
              {/* Phone Input */}
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Request...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Instant Review & Spin Reward</>
                )}
              </Button>
            </form>

            {/* Success Result Box */}
            {lastSentLink && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center space-y-2 animate-scale-in">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  {sentViaWa ? 'Sent via WhatsApp to Customer!' : 'Review Link Ready!'}
                </div>
                <p className="text-[11px] text-muted-foreground font-mono break-all bg-background/60 p-2 rounded-lg border border-border/40">
                  {lastSentLink}
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      navigator.clipboard.writeText(lastSentLink)
                      toast.success('Link copied!')
                    }}
                    className="text-xs font-bold gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      window.open(lastSentLink, '_blank')
                    }}
                    className="text-xs font-bold gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Open Preview
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        {activeStaff && (
          <p className="text-[11px] text-center text-muted-foreground">
            Attributed to staff: <strong className="text-foreground">{activeStaff.name}</strong> ({activeStaff.role})
          </p>
        )}
      </div>
    </div>
  )
}
