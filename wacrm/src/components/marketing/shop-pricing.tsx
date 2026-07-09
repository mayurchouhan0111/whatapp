"use client"

import Link from "next/link"
import { ShoppingBag, Zap, CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"
import { SectionBadge } from "./section-badge"

const TIERS = [
  {
    plan: "Starter",
    monthlyPrice: "₹999",
    annualPrice: "₹799",
    period: "/mo",
    description: "For small businesses launching their first online store.",
    products: "20 products",
    orders: "50 orders/mo",
    highlighted: false,
    features: [
      "Product catalog with categories",
      "Instant search & filters",
      "WhatsApp ordering",
      "Order management dashboard",
      "UPI & COD payments",
      "Delivery fee auto-calculation",
      "Basic analytics",
    ],
  },
  {
    plan: "Pro",
    monthlyPrice: "₹2,999",
    annualPrice: "₹2,499",
    period: "/mo",
    description: "For growing businesses ready to scale their WhatsApp sales.",
    products: "150 products",
    orders: "500 orders/mo",
    highlighted: true,
    features: [
      "Everything in Starter",
      "CSV bulk product import",
      "Advanced sales analytics",
      "Export reports to CSV",
      "Auto-confirm & status updates",
      "Customer order history",
      "Priority support",
    ],
  },
  {
    plan: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    period: "",
    description: "For large businesses with custom requirements.",
    products: "Unlimited products",
    orders: "Unlimited orders",
    highlighted: false,
    features: [
      "Everything in Pro",
      "White-label storefront",
      "Custom domain support",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment",
    ],
  },
]

export function ShopPricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><Sparkles className="h-3 w-3" /> Pricing</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Simple Pricing for Every Store
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The WhatsApp Storefront is included in all paid plans. No setup fees, no hidden costs.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/40 bg-card p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice
            return (
              <div
                key={tier.plan}
                className={`group relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlighted
                    ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-xl shadow-primary/10 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-border/80 hover:shadow-xl backdrop-blur-sm"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{tier.plan}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{price}</span>
                  {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  {annual && tier.annualPrice !== "Custom" && (
                    <p className="mt-1 text-xs text-emerald-500">Billed annually (₹{tier.annualPrice.replace("₹", "")} × 12)</p>
                  )}
                </div>

                <div className="mb-6 space-y-2 rounded-xl bg-card-2/50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{tier.products}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{tier.orders}</span>
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-[#0fe875] border-2 border-gray-900 text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
                      : "border border-border bg-card text-foreground hover:bg-accent hover:-translate-y-0.5"
                  }`}
                >
                  {tier.plan === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
