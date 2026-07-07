"use client"

import { useState } from "react"
import { Store, ClipboardList, BarChart3, ShoppingBag, Package, TrendingUp, CheckCircle, Zap } from "lucide-react"

const tabs = [
  {
    id: "storefront",
    label: "Storefront",
    icon: Store,
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    id: "orders",
    label: "Orders Dashboard",
    icon: ClipboardList,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
]

const tabContent = {
  storefront: {
    title: "Beautiful Storefront, Zero Code",
    description: "Your customers see a mobile-optimized product catalog with instant search, category browsing, and one-tap cart.",
    highlights: [
      { icon: Zap, text: "Loads in under 2 seconds" },
      { icon: ShoppingBag, text: "Unlimited products & categories" },
      { icon: CheckCircle, text: "Works on any device" },
    ],
    mockup: (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-bold text-violet-500">HS</div>
            <div>
              <p className="text-sm font-medium text-foreground">Handloom Saree</p>
              <p className="text-xs text-muted-foreground">Traditional · ₹899</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">₹899</p>
            <p className="text-[10px] text-emerald-500">24 sold</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-500">OH</div>
            <div>
              <p className="text-sm font-medium text-foreground">Organic Honey</p>
              <p className="text-xs text-muted-foreground">Food · ₹349</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">₹349</p>
            <p className="text-[10px] text-emerald-500">18 sold</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-500">BP</div>
            <div>
              <p className="text-sm font-medium text-foreground">Bamboo Planter</p>
              <p className="text-xs text-muted-foreground">Home · ₹499</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">₹499</p>
            <p className="text-[10px] text-emerald-500">12 sold</p>
          </div>
        </div>
      </div>
    ),
  },
  orders: {
    title: "Complete Order Management",
    description: "Every order appears in real-time. Update status, track delivery, and message customers — all from one dashboard.",
    highlights: [
      { icon: Package, text: "Real-time order tracking" },
      { icon: TrendingUp, text: "Status: Pending → Delivered" },
      { icon: Zap, text: "Auto-confirm via WhatsApp" },
    ],
    mockup: (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-[10px] font-bold text-violet-500">PS</div>
            <div>
              <p className="text-sm font-medium text-foreground">#ORD-0042</p>
              <p className="text-xs text-muted-foreground">Priya Sharma · ₹1,248</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-500">Pending</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-[10px] font-bold text-emerald-500">RV</div>
            <div>
              <p className="text-sm font-medium text-foreground">#ORD-0041</p>
              <p className="text-xs text-muted-foreground">Rahul Verma · ₹899</p>
            </div>
          </div>
          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-500">Confirmed</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-[10px] font-bold text-amber-500">AG</div>
            <div>
              <p className="text-sm font-medium text-foreground">#ORD-0040</p>
              <p className="text-xs text-muted-foreground">Ananya Gupta · ₹499</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-500">Delivered</span>
        </div>
      </div>
    ),
  },
  analytics: {
    title: "Real-Time Sales Analytics",
    description: "Track revenue, top sellers, order trends, and customer insights. Export reports with one click.",
    highlights: [
      { icon: BarChart3, text: "Revenue & order trends" },
      { icon: TrendingUp, text: "Top products report" },
      { icon: CheckCircle, text: "Export to CSV" },
    ],
    mockup: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/60 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Today</p>
            <p className="text-lg font-bold text-foreground">₹12.4K</p>
            <p className="text-[10px] text-emerald-500">+18% vs yesterday</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-lg font-bold text-foreground">₹84.2K</p>
            <p className="text-[10px] text-emerald-500">+12% vs last week</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <p className="mb-2 text-xs font-medium text-foreground">Top Products</p>
          <div className="space-y-1.5">
            {[
              { name: "Handloom Saree", sales: "24 units", revenue: "₹21,576" },
              { name: "Organic Honey", sales: "18 units", revenue: "₹6,282" },
              { name: "Bamboo Planter", sales: "12 units", revenue: "₹5,988" },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{p.name}</span>
                <div className="flex gap-3">
                  <span className="text-muted-foreground">{p.sales}</span>
                  <span className="font-medium text-foreground">{p.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
}

export function ShopShowcase() {
  const [activeTab, setActiveTab] = useState("storefront")

  const current = tabContent[activeTab as keyof typeof tabContent]

  return (
    <section className="border-b border-border/50 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            See the Store in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse the customer storefront, manage orders, and track sales — all from your CRM.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-border/60 bg-card p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{current.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{current.description}</p>
            <ul className="mt-6 space-y-3">
              {current.highlights.map((h) => {
                const Icon = h.icon
                return (
                  <li key={h.text} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {h.text}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-lg" />
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-2xl shadow-primary/5">
              <div className="mb-4 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-destructive/60" />
                <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-[10px] text-muted-foreground">
                  {activeTab === "storefront" ? "Customer Storefront" : activeTab === "orders" ? "Orders Dashboard" : "Analytics View"}
                </span>
              </div>
              {current.mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
