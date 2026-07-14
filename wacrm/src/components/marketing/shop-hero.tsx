"use client"

import Link from "next/link"
import { ArrowRight, Store, ShoppingBag, Users, BarChart3, CheckCircle } from "lucide-react"
import { useState } from "react"

const AVATARS = [
  { initials: "RM", color: "from-violet-500 to-violet-600" },
  { initials: "KJ", color: "from-emerald-500 to-emerald-600" },
  { initials: "AP", color: "from-amber-500 to-amber-600" },
  { initials: "SR", color: "from-rose-500 to-rose-600" },
  { initials: "VS", color: "from-blue-500 to-blue-600" },
]

const MOCKUP_TABS = [
  { id: "store", label: "Store", icon: Store },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "sales", label: "Sales", icon: BarChart3 },
]

const MOCKUP_CONTENT: Record<string, { title: string; subtitle: string; items: { label: string; value: string; color: string }[] }> = {
  store: {
    title: "Your Storefront",
    subtitle: "24 products live",
    items: [
      { label: "Products", value: "24", color: "text-primary" },
      { label: "Categories", value: "6", color: "text-emerald-500" },
      { label: "Today views", value: "187", color: "text-amber-500" },
    ],
  },
  orders: {
    title: "Order Dashboard",
    subtitle: "12 new today",
    items: [
      { label: "Pending", value: "4", color: "text-amber-500" },
      { label: "Shipped", value: "8", color: "text-blue-500" },
      { label: "Delivered", value: "23", color: "text-emerald-500" },
    ],
  },
  sales: {
    title: "Sales Analytics",
    subtitle: "Last 30 days",
    items: [
      { label: "Revenue", value: "₹84.2K", color: "text-primary" },
      { label: "Orders", value: "156", color: "text-emerald-500" },
      { label: "Conversion", value: "18%", color: "text-amber-500" },
    ],
  },
}

export function ShopHero() {
  const [activeTab, setActiveTab] = useState("store")
  const content = MOCKUP_CONTENT[activeTab]

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute top-0 -left-40 h-[500px] w-[500px] animate-float rounded-full bg-gradient-to-br from-violet-600/20 via-primary/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 -right-40 h-[500px] w-[500px] animate-float-slow rounded-full bg-gradient-to-br from-emerald-500/15 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/5">
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            WhatsApp Storefront — Powered by Vbuild CRM
          </div>

          <h1 className="mt-6 animate-slide-up text-balance text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
            Turn Your WhatsApp Into a
            <br className="hidden sm:block" />
            <span className="inline-block bg-[#0fe875] border-2 border-gray-900 px-3 py-1 mt-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] -rotate-1 text-gray-900">
              Selling Machine
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-balance text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:100ms]">
            Launch a mobile-optimized storefront connected to your WhatsApp in minutes. Customers browse, cart, and checkout — you get orders instantly in your CRM dashboard.
          </p>

          <div className="mt-8 flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:200ms]">
            <Link
              href="/signup"
              className="btn-primary h-12"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="btn-ghost h-12"
            >
              See Plans
            </Link>
          </div>

          <div className="mt-8 flex animate-fade-in flex-col items-center gap-4 sm:flex-row sm:justify-center [animation-delay:300ms]">
            <div className="flex -space-x-3">
              {AVATARS.map((avatar) => (
                <div
                  key={avatar.initials}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br ${avatar.color} text-[10px] font-bold text-white shadow-sm`}
                >
                  {avatar.initials}
                </div>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[10px] font-bold text-primary shadow-sm">
                +2.4K
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,400+</span> store owners trust Vbuild
            </div>
          </div>
        </div>

        {/* Floating storefront mockup */}
        <div className="mx-auto mt-16 max-w-3xl animate-slide-up [animation-delay:400ms]">
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/25 via-primary/10 to-emerald-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 border-b border-border/40 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <div className="ml-3 flex-1 text-center text-xs font-medium text-muted-foreground/70">store.vbuildcrm.com/your-brand</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>

              <div className="flex border-b border-border/30">
                {MOCKUP_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-b-2 border-primary text-foreground bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-5 transition-all duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{content.title}</p>
                    <p className="text-xs text-muted-foreground">{content.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">86 customers</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {content.items.map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/40 bg-card-2 p-3.5 text-center">
                      <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>

                {activeTab === "store" && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { name: "Handloom Saree", price: "₹899", orders: "24 sold", gradient: "from-violet-500/20 to-violet-500/5" },
                      { name: "Organic Honey", price: "₹349", orders: "18 sold", gradient: "from-amber-500/20 to-amber-500/5" },
                      { name: "Bamboo Planter", price: "₹499", orders: "12 sold", gradient: "from-emerald-500/20 to-emerald-500/5" },
                    ].map((item) => (
                      <div key={item.name} className={`rounded-xl bg-gradient-to-br ${item.gradient} p-3 text-center`}>
                        <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-lg bg-card/60 text-xs font-bold text-foreground">
                          {item.name.split(" ").map(w => w[0]).join("")}
                        </div>
                        <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs font-bold text-primary">{item.price}</p>
                        <p className="text-[9px] text-muted-foreground">{item.orders}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="mt-4 space-y-2">
                    {[
                      { id: "#ORD-0042", name: "Priya Sharma", amount: "₹1,248", status: "Pending", color: "text-amber-500" },
                      { id: "#ORD-0041", name: "Rahul Verma", amount: "₹899", status: "Delivered", color: "text-emerald-500" },
                    ].map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-xl bg-primary/5 p-3 ring-1 ring-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-bold text-primary">
                            {order.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{order.id} · {order.name}</p>
                            <p className="text-[10px] text-muted-foreground">{order.amount}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-medium ${order.color}`}>{order.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "sales" && (
                  <div className="mt-4">
                    <div className="flex h-20 items-end gap-2 rounded-xl border border-border/40 bg-card-2 p-3">
                      {[45, 65, 50, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary/60" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between px-1 text-[10px] text-muted-foreground">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex animate-fade-in flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground [animation-delay:500ms]">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            No credit card
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            Setup in minutes
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            UPI & COD included
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            Free CRM included
          </div>
        </div>
      </div>
    </section>
  )
}
