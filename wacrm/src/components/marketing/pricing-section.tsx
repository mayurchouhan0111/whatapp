"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"
import { SectionBadge } from "./section-badge"

const TIERS = [
  {
    name: "Free",
    monthlyPrice: "₹0",
    annualPrice: "₹0",
    period: "/mo",
    description: "For solo entrepreneurs and testing.",
    features: [
      "1 user",
      "500 contacts",
      "500 conversations/mo",
      "100 broadcasts/mo",
      "1 WhatsApp number",
    ],
    missingFeatures: [
      "WhatsApp Store",
      "Flows & automations",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Starter",
    monthlyPrice: "₹999",
    annualPrice: "₹9,999",
    period: "/mo",
    description: "For small teams ready to grow.",
    features: [
      "3 agents",
      "2,500 contacts",
      "2,500 conversations/mo",
      "1,000 broadcasts/mo",
      "WhatsApp Store (50 products)",
      "1 active flow (bot builder)",
    ],
    missingFeatures: [],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Growth",
    monthlyPrice: "₹1,999",
    annualPrice: "₹19,999",
    period: "/mo",
    description: "Most popular — for growing teams.",
    features: [
      "10 agents",
      "15,000 contacts",
      "15,000 conversations/mo",
      "10,000 broadcasts/mo",
      "WhatsApp Store (500 products)",
      "10 active flows (bot builder)",
      "3 WhatsApp numbers",
      "API access",
    ],
    missingFeatures: [],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Pro",
    monthlyPrice: "₹3,999",
    annualPrice: "₹39,999",
    period: "/mo",
    description: "For businesses scaling high-volume sales.",
    features: [
      "25 agents",
      "50,000 contacts",
      "50,000 conversations/mo",
      "50,000 broadcasts/mo",
      "WhatsApp Store (2,500 products)",
      "Unlimited active flows",
      "5 WhatsApp numbers",
      "Full API access",
      "Priority support",
    ],
    missingFeatures: [],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><Sparkles className="h-3 w-3" /> Pricing</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Start free. Upgrade when you grow. No hidden fees.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Save ~16%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {TIERS.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  tier.highlighted
                    ? "border-emerald-200 bg-white shadow-lg shadow-emerald-100/50 ring-2 ring-emerald-200"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{price}</span>
                  <span className="text-sm text-gray-400">
                    {annual && tier.annualPrice !== "₹0" ? "/yr" : tier.period}
                  </span>
                  {annual && tier.annualPrice !== "₹0" && (
                    <p className="mt-1 text-xs text-emerald-600">
                      ₹{tier.monthlyPrice.replace("₹", "").replace(",", "")}/mo billed annually
                    </p>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                  {tier.missingFeatures?.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="h-4 w-4 shrink-0 rounded-full border border-gray-300 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-[#0fe875] border-2 border-gray-900 text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
                      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:-translate-y-0.5"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          Enterprise plan available for large teams.{" "}
          <Link href="/pricing" className="font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline">
            View full pricing details &rarr;
          </Link>
        </p>
      </div>
    </section>
  )
}
