"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Users, MessageSquare, IndianRupee } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Customer {
  contact_id: string | null
  name: string
  phone: string
  total_orders: number
  total_spent: number
  last_order: string
}

export default function CustomersPage() {
  const supabase = createClient()
  const { accountId, user, profileLoading } = useAuth()
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadCustomers()
  }, [profileLoading, accountId])

  async function loadCustomers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select("contact_id, customer_name, customer_phone, total_amount, created_at")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false })

      if (error) throw error
      const orders = data || []

      const customerMap = new Map<string, Customer>()
      for (const order of orders as any[]) {
        const phone = order.customer_phone || "unknown"
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            contact_id: order.contact_id,
            name: order.customer_name,
            phone,
            total_orders: 0,
            total_spent: 0,
            last_order: order.created_at,
          })
        }
        const entry = customerMap.get(phone)!
        entry.total_orders++
        entry.total_spent += Number(order.total_amount || 0)
        if (new Date(order.created_at) > new Date(entry.last_order)) {
          entry.last_order = order.created_at
        }
      }

      const sorted = [...customerMap.values()].sort((a, b) => b.total_spent - a.total_spent)
      setCustomers(sorted)
    } catch (err) {
      console.error("Load customers error:", err)
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  async function handleChat(contactId: string | null) {
    if (!contactId) { toast.error("No contact associated."); return }
    try {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("contact_id", contactId)
        .maybeSingle()
      if (existingConv) { router.push(`/inbox?c=${existingConv.id}`); return }
      if (!user) { toast.error("User session not found."); return }
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, contact_id: contactId, status: "open" })
        .select()
        .single()
      if (error || !newConv) throw error || new Error("Failed")
      router.push(`/inbox?c=${newConv.id}`)
    } catch {
      toast.error("Could not open chat")
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{customers.length} customer{customers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No customers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Customers who place orders will appear here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Orders</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Spent</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Last Order</th>
                <th className="w-20 px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{c.total_orders}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{c.total_spent.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(c.last_order).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleChat(c.contact_id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Chat with customer"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
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
