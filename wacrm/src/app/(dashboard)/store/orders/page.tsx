"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search, Loader2, ShoppingBag, MessageSquare, ChevronDown, X, IndianRupee
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Order {
  id: string
  account_id: string
  contact_id: string | null
  customer_name: string
  customer_phone: string
  delivery_address: string
  total_amount: number
  payment_method: string
  payment_status: string
  order_status: string
  items: any
  deal_id: string | null
  created_at: string
}

export default function OrdersPage() {
  const supabase = createClient()
  const { accountId, user, profileLoading } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadOrders()
  }, [profileLoading, accountId])

  async function loadOrders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false })
      if (error) throw error
      setOrders((data as Order[]) || [])
    } catch (err) {
      console.error("Load orders error:", err)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)
      if (error) throw error
      toast.success(`Order status updated to ${newStatus}`)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus })
      }
    } catch (err) {
      console.error("Update order status error:", err)
      toast.error("Failed to update order status")
    }
  }

  async function updatePaymentStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)
      if (error) throw error
      toast.success(`Payment status updated to ${newStatus}`)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: newStatus })
      }
    } catch (err) {
      console.error("Update payment status error:", err)
      toast.error("Failed to update payment status")
    }
  }

  async function handleChatWithCustomer(order: Order) {
    if (!order.contact_id) {
      toast.error("This order is not associated with a contact.")
      return
    }
    try {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("contact_id", order.contact_id)
        .maybeSingle()
      if (existingConv) {
        router.push(`/inbox?c=${existingConv.id}`)
        return
      }
      if (!user) { toast.error("User session not found."); return }
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, contact_id: order.contact_id, status: "open" })
        .select()
        .single()
      if (createError || !newConv) throw createError || new Error("Failed to create conversation")
      router.push(`/inbox?c=${newConv.id}`)
    } catch (err) {
      console.error("Redirect to inbox error:", err)
      toast.error("Could not open chat room.")
    }
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.id.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by customer or order ID..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No orders yet</p>
          <p className="text-xs text-muted-foreground mt-1">Orders from your storefront will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            })
            const itemsList =
              typeof order.items === "string"
                ? JSON.parse(order.items)
                : Array.isArray(order.items)
                  ? order.items
                  : []
            const STATUS_VARIANTS: Record<string, string> = {
              pending: "bg-amber-50 text-amber-700 border-amber-200",
              confirmed: "bg-blue-50 text-blue-700 border-blue-200",
              delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
              cancelled: "bg-red-50 text-red-700 border-red-200",
            }

            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm cursor-pointer"
                onClick={() => { setSelectedOrder(order); setDetailOpen(true) }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold">
                      #{order.id.slice(0, 4).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone} &middot; {dateStr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_VARIANTS[order.order_status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                    <span className="text-sm font-bold">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Detail Drawer Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    selectedOrder.order_status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    selectedOrder.order_status === "confirmed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    selectedOrder.order_status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {selectedOrder.order_status.charAt(0).toUpperCase() + selectedOrder.order_status.slice(1)}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Customer</p>
                    <p className="text-sm font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Payment Method</p>
                    <p className="text-sm font-medium uppercase">{selectedOrder.payment_method}</p>
                    <p className="text-xs text-muted-foreground">Total: ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm">{selectedOrder.delivery_address}</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Items ({Array.isArray(selectedOrder.items) ? selectedOrder.items.length : 0})</p>
                  <div className="space-y-1.5">
                    {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} <span className="font-medium">x{item.quantity}</span></span>
                        <span className="font-medium">₹{Number(item.price || item.sale_price || 0) * (item.quantity || 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Payment Status</p>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Order Status</p>
                    <select
                      value={selectedOrder.order_status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleChatWithCustomer(selectedOrder)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Customer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
