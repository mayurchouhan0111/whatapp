"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Package, ListOrdered, IndianRupee, Clock, Power, Plus, Upload, Eye, ExternalLink, Loader2, ShoppingCart } from "lucide-react"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  revenue: number
  pendingOrders: number
  storeActive: boolean
  storeSlug: string
  maxProducts: number
}

export default function StoreDashboard() {
  const supabase = createClient()
  const { accountId, profileLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    storeActive: false,
    storeSlug: "",
    maxProducts: 0,
  })

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadStats()
  }, [profileLoading, accountId])

  async function loadStats() {
    try {
      setLoading(true)

      const { data: account } = await supabase
        .from("accounts")
        .select("max_products, max_orders_per_month")
        .eq("id", accountId)
        .maybeSingle()

      const maxProducts = (account as any)?.max_products || 0

      const { data: config } = await supabase
        .from("store_configs")
        .select("slug, is_active")
        .eq("account_id", accountId)
        .maybeSingle()

      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("account_id", accountId)

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, order_status, payment_status")
        .eq("account_id", accountId)

      const orderList = orders || []
      const totalOrders = orderList.length
      const revenue = orderList
        .filter((o: any) => o.payment_status === "paid")
        .reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0)
      const pendingOrders = orderList.filter((o: any) => o.order_status === "pending").length

      setStats({
        totalProducts: productCount || 0,
        totalOrders,
        revenue,
        pendingOrders,
        storeActive: config?.is_active ?? false,
        storeSlug: config?.slug || "",
        maxProducts,
      })
    } catch (err) {
      console.error("Dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }

  function openStorefront() {
    if (stats.storeSlug) {
      window.open(`/shop/${stats.storeSlug}`, "_blank")
    } else {
      toast.error("Set up your store slug in Store Settings first.")
    }
  }

  const cards = [
    {
      label: "Total Products",
      value: `${stats.totalProducts}${stats.maxProducts ? ` / ${stats.maxProducts}` : ""}`,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50",
      href: "/store/products",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-violet-500",
      bg: "bg-violet-50",
      href: "/store/orders",
    },
    {
      label: "Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
      href: "/store/orders",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your online store, products, and orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              stats.storeActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                stats.storeActive ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {stats.storeActive ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const content = (
            <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          )
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          )
        })}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push("/store/products")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Add Product</p>
              <p className="text-xs text-muted-foreground">Create a new product</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/store/products")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Import Products</p>
              <p className="text-xs text-muted-foreground">Bulk import via CSV</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/store/orders")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">View Orders</p>
              <p className="text-xs text-muted-foreground">Manage customer orders</p>
            </div>
          </button>
          <button
            onClick={openStorefront}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Open Storefront</p>
              <p className="text-xs text-muted-foreground">View public store</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
