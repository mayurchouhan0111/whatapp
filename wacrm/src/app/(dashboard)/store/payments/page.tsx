"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, CreditCard, IndianRupee } from "lucide-react"

export default function PaymentsPage() {
  const supabase = createClient()
  const { accountId, profileLoading } = useAuth()

  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadPayments()
  }, [profileLoading, accountId])

  async function loadPayments() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, total_amount, payment_method, payment_status, created_at")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      console.error("Load payments error:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalCollected = payments
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + Number(p.total_amount || 0), 0)

  const totalPending = payments
    .filter((p) => p.payment_status === "pending")
    .reduce((sum, p) => sum + Number(p.total_amount || 0), 0)

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Collected</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">₹{totalCollected.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending Collection</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Transactions</p>
          <p className="mt-1 text-2xl font-bold">{payments.length}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No payments yet</p>
          <p className="text-xs text-muted-foreground mt-1">Payments from completed orders will appear here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{p.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 uppercase text-xs font-medium">{p.payment_method}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{Number(p.total_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" :
                      p.payment_status === "failed" ? "bg-red-50 text-red-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {p.payment_status.charAt(0).toUpperCase() + p.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
