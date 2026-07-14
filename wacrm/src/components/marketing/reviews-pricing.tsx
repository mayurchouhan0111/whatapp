"use client"

import Link from "next/link"
import { Star, Zap, CheckCircle, ArrowRight, Sparkles, MessageSquare, Gift } from "lucide-react"
import { useState } from "react"
import { SectionBadge } from "./section-badge"

const TIERS = [
  {
    plan: "Reviews Only",
    monthlyPrice: "₹199",
    annualPrice: "₹1,999",
    period: "/mo",
    description: "Google Review collection without the full CRM.",
    reviewsPerMonth: "50 reviews/mo",
    highlighted: false,
    features: [
      "QR code review poster",
      "Google Review deep links",
      "WhatsApp review alerts",
      "Review management dashboard",
      "Print-ready poster download",
      "Basic review analytics",
    ],
  },
  {
    plan: "Included in Starter",
    monthlyPrice: "₹999",
    annualPrice: "₹9,999",
    period: "/mo",
    description: "Reviews + full WhatsApp CRM — best value.",
    reviewsPerMonth: "50 reviews/mo",
    highlighted: true,
    features: [
      "Everything in Reviews Only",
      "Full WhatsApp CRM (shared inbox)",
      "Contact & lead management",
      "Sales pipelines (Kanban)",
      "1 active flow (bot builder)",
      "1,000 broadcasts/month",
      "3 team agents",
    ],
    cta: "Get Started",
    href: "/pricing",
  },
  {
    plan: "Included in Growth",
    monthlyPrice: "₹1,999",
    annualPrice: "₹19,999",
    period: "/mo",
    description: "For businesses scaling with automation.",
    reviewsPerMonth: "500 reviews/mo",
    highlighted: false,
    features: [
      "Everything in Starter",
      "Automated review requests",
      "10 active flows (bot builder)",
      "10,000 broadcasts/month",
      "10 team agents",
      "3 WhatsApp numbers",
      "API access",
      "Priority support",
    ],
    cta: "Get Started",
    href: "/pricing",
  },
]

export function ReviewsPricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="border-b border-border/40" id="reviews-pricing">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><MessageSquare className="h-3 w-3" /> Review Collection Pricing</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Start Collecting Google Reviews Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The Review Collection platform is included free in every paid CRM plan. Or get it standalone for ₹199/mo.
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
                Save ~16%
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
                      Best Value
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{tier.plan}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{price}</span>
                  {tier.period && <span className="text-sm text-muted-foreground">{annual ? "/yr" : tier.period}</span>}
                  {annual && tier.annualPrice !== "Custom" && (
                    <p className="mt-1 text-xs text-emerald-500">
                      ₹{tier.monthlyPrice.replace("₹", "")}/mo billed annually
                    </p>
                  )}
                </div>

                <div className="mb-6 space-y-2 rounded-xl bg-card-2/50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-foreground">{tier.reviewsPerMonth}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Unlimited QRs & posters</span>
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

                {tier.cta ? (
                  <Link
                    href={tier.href || "/signup"}
                    className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                      tier.highlighted
                        ? "bg-[#0fe875] border-2 border-gray-900 text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
                        : "border border-border bg-card text-foreground hover:bg-accent hover:-translate-y-0.5"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-foreground transition-all duration-300 hover:bg-accent hover:-translate-y-0.5"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gift className="h-4 w-4 text-primary" />
            <span>Reviews are included <strong>free</strong> in Starter, Growth, and Pro CRM plans.</span>
          </div>
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
