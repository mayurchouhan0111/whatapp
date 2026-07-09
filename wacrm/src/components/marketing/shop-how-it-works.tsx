"use client"

import { useState } from "react"
import { ShoppingBag, ShoppingCart, ClipboardList, CreditCard, Send, PackageCheck, ArrowRight, Smartphone } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const steps = [
  {
    icon: ShoppingBag,
    title: "Browse Products",
    description: "Customers visit your branded storefront, browse by category, and search products with instant results.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    mockup: (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-card p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-500">H</div>
            <div>
              <p className="text-[11px] font-medium text-foreground">Handloom Saree</p>
              <p className="text-[10px] text-muted-foreground">₹899</p>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-card p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-500">O</div>
            <div>
              <p className="text-[11px] font-medium text-foreground">Organic Honey</p>
              <p className="text-[10px] text-muted-foreground">₹349</p>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select items with quantity controls. Real-time subtotal, delivery fee calculation, and savings badges.",
gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
    mockup: (
      <div className="rounded-lg border border-border/30 bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-foreground">Cart (2 items)</span>
          <span className="text-[10px] text-primary font-medium">₹1,248</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Handloom Saree x1</span>
            <span className="text-foreground font-medium">₹899</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Organic Honey x1</span>
            <span className="text-foreground font-medium">₹349</span>
          </div>
          <div className="border-t border-border/30 pt-1.5 text-[10px]">
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="text-emerald-500 font-medium">Free</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: ClipboardList,
    title: "Checkout Details",
    description: "Customer fills name, WhatsApp number, and delivery address. All fields validated instantly.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    mockup: (
      <div className="space-y-1.5">
        {["Full Name", "WhatsApp Number", "Delivery Address"].map((label) => (
          <div key={label} className="rounded-lg border border-border/30 bg-card px-3 py-2">
            <p className="text-[9px] text-muted-foreground">{label}</p>
            <p className="text-[11px] text-foreground/30">&nbsp;</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: CreditCard,
    title: "Choose Payment",
    description: "UPI (QR/ID) or Cash on Delivery. Delivery free above ₹300, minimal handling fee otherwise.",
gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
    mockup: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary">✓</div>
          <span className="text-[11px] font-medium text-foreground">UPI Payment</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-card px-3 py-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[8px] text-muted-foreground">○</div>
          <span className="text-[11px] text-muted-foreground">Cash on Delivery</span>
        </div>
      </div>
    ),
  },
  {
    icon: Send,
    title: "Order via WhatsApp",
    description: "One tap opens WhatsApp with a pre-formatted order summary. Customer just hits send.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    mockup: (
      <div className="rounded-lg border border-border/30 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
            <Send className="h-2.5 w-2.5 text-emerald-500" />
          </div>
          <span className="text-[10px] font-medium text-foreground">WhatsApp Preview</span>
        </div>
        <div className="rounded-lg bg-muted p-2.5">
          <p className="text-[9px] text-muted-foreground">Hi! My order:</p>
          <p className="mt-1 text-[9px] text-muted-foreground">1x Handloom Saree - ₹899</p>
          <p className="text-[9px] text-muted-foreground">1x Organic Honey - ₹349</p>
          <p className="mt-1 text-[9px] font-medium text-foreground">Total: ₹1,248</p>
        </div>
      </div>
    ),
  },
  {
    icon: PackageCheck,
    title: "Confirm & Deliver",
    description: "Order appears in your dashboard. Update status: Pending → Confirmed → Delivered. Chat with customer.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    mockup: (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-card p-2.5">
          <div>
            <p className="text-[10px] font-medium text-foreground">#ORD-0042</p>
            <p className="text-[9px] text-muted-foreground">Priya Sharma · ₹1,248</p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-500">Pending</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-card p-2.5">
          <div>
            <p className="text-[10px] font-medium text-foreground">#ORD-0041</p>
            <p className="text-[9px] text-muted-foreground">Rahul Verma · ₹899</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-500">Delivered</span>
        </div>
      </div>
    ),
  },
]

export function ShopHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><Smartphone className="h-3 w-3" /> How It Works</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            From Browse to Delivery — All in Under 30 Seconds
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No app download. No account creation. Just WhatsApp.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-2">
            {steps.map((step, i) => {
              const Icon = step.icon
              const isActive = activeStep === i
              return (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(i)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
                      : "border-border/40 bg-card hover:border-border hover:shadow-md"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${step.gradient} shadow-sm`
                        : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? step.iconColor : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <h3 className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-all ${
                    isActive ? "translate-x-0.5 text-primary" : "text-muted-foreground"
                  }`} />
                </button>
              )
            })}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-xl" />
            <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border/40 bg-card p-5 shadow-2xl shadow-primary/5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-3 w-3" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">Customer View</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                </div>
              </div>
              {steps[activeStep].mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
