"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, HelpCircle, Sparkles } from "lucide-react"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { PricingSubscribeButton } from "@/components/marketing/pricing-subscribe-button"
import { useState } from "react"

const plans = [
  {
    name: "Free",
    monthlyPrice: "₹0",
    annualPrice: "₹0",
    usdPrice: "$0",
    usdAnnual: "$0",
    period: "/mo",
    description: "For solo entrepreneurs testing the waters.",
    features: [
      { text: "1 user (solo)", included: true },
      { text: "Up to 500 contacts", included: true },
      { text: "500 conversations/month", included: true },
      { text: "100 broadcasts/month", included: true },
      { text: "1 WhatsApp number", included: true },
      { text: "1 pipeline (Kanban board)", included: true },
      { text: "Google Review Feedback", included: false },
      { text: "WhatsApp Storefront", included: false },
      { text: "Flows & automations (bot builder)", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
    popular: false,
  },
  {
    name: "Starter",
    monthlyPrice: "₹999",
    annualPrice: "₹9,999",
    usdPrice: "$19",
    usdAnnual: "$199",
    period: "/mo",
    description: "For small teams ready to grow.",
    features: [
      { text: "Up to 3 agents", included: true },
      { text: "Up to 2,500 contacts", included: true },
      { text: "2,500 conversations/month", included: true },
      { text: "1,000 broadcasts/month", included: true },
      { text: "1 WhatsApp number", included: true },
      { text: "2 pipelines (Kanban boards)", included: true },
      { text: "1 active flow (bot builder)", included: true },
      { text: "Google Review Feedback (50 req/mo)", included: true },
      { text: "WhatsApp Store (50 products, 100 orders/mo)", included: true },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: "₹1,999",
    annualPrice: "₹19,999",
    usdPrice: "$39",
    usdAnnual: "$399",
    period: "/mo",
    description: "Our most popular plan for growing teams.",
    features: [
      { text: "Up to 10 agents", included: true },
      { text: "Up to 15,000 contacts", included: true },
      { text: "15,000 conversations/month", included: true },
      { text: "10,000 broadcasts/month", included: true },
      { text: "3 WhatsApp numbers", included: true },
      { text: "5 pipelines (Kanban boards)", included: true },
      { text: "10 active flows (bot builder)", included: true },
      { text: "Google Review Feedback (500 req/mo)", included: true },
      { text: "WhatsApp Store (500 products, 1,000 orders/mo)", included: true },
      { text: "API access (limited)", included: true },
      { text: "Priority chat support", included: true },
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
    popular: true,
  },
  {
    name: "Pro",
    monthlyPrice: "₹3,999",
    annualPrice: "₹39,999",
    usdPrice: "$79",
    usdAnnual: "$799",
    period: "/mo",
    description: "For businesses scaling high-volume sales.",
    features: [
      { text: "Up to 25 agents", included: true },
      { text: "Up to 50,000 contacts", included: true },
      { text: "50,000 conversations/month", included: true },
      { text: "50,000 broadcasts/month", included: true },
      { text: "5 WhatsApp numbers", included: true },
      { text: "Unlimited pipelines", included: true },
      { text: "Unlimited active flows", included: true },
      { text: "Google Review Feedback (5,000 req/mo)", included: true },
      { text: "WhatsApp Store (2,500 products, 5,000 orders/mo)", included: true },
      { text: "Full API access", included: true },
      { text: "Priority chat & phone support", included: true },
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
    popular: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    usdPrice: "Custom",
    usdAnnual: "Custom",
    period: "",
    description: "For large teams with custom needs.",
    features: [
      { text: "Unlimited agents", included: true },
      { text: "Unlimited contacts", included: true },
      { text: "Unlimited conversations", included: true },
      { text: "Custom broadcast limits", included: true },
      { text: "Unlimited WhatsApp numbers", included: true },
      { text: "Unlimited pipelines", included: true },
      { text: "Unlimited active flows", included: true },
      { text: "Google Review Feedback (Unlimited)", included: true },
      { text: "WhatsApp Store (Unlimited products & orders)", included: true },
      { text: "Full API access", included: true },
      { text: "White-label branding", included: true },
      { text: "On-premise deployment option", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Us",
    href: "mailto:sales@vbuildcrm.com",
    highlighted: false,
    popular: false,
  },
]

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime. Changes take effect immediately. Your data stays intact.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "All paid plans come with a 14-day free trial. No credit card required. Cancel anytime.",
  },
  {
    q: "Which plan is right for me?",
    a: "Starter is ideal for teams of 2-3 getting started. Growth (our most popular) fits teams of 4-10 with automation needs. Pro is for teams of 10-25 scaling high-volume sales. Not sure? Start free and upgrade as you grow.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI (India), and bank transfers for annual plans.",
  },
  {
    q: "Can I use my own WhatsApp Business number?",
    a: "Yes. Vbuild CRM works with any WhatsApp Business API account. Connect your existing number in minutes.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted at rest and in transit. Tokens are AES-256-GCM encrypted. We use Row-Level Security on every database table.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes. Annual plans save you roughly 16% compared to monthly billing. Pay once, worry less.",
  },
  {
    q: "What if I exceed my plan limits?",
    a: "We'll notify you when you're approaching a limit. You can upgrade instantly with no downtime.",
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <>
      <Header />
      <main>
        {/* Hero — visually identical to Store hero for consistent brand experience */}
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
                Start Free — Upgrade When You Grow
              </div>

              <h1 className="mt-6 animate-slide-up text-balance text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
                Simple,
                <br className="hidden sm:block" />
                <span className="inline-block bg-[#0fe875] border-2 border-gray-900 px-3 py-1 mt-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] -rotate-1 text-gray-900">
                  Transparent
                </span>
                {" "}Pricing
              </h1>

              <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-balance text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:100ms]">
                Start free. Upgrade when you grow. No hidden fees, no surprises — just the tools you need to turn WhatsApp into your sales channel.
              </p>

              <div className="mt-8 flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:200ms]">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0fe875] border-2 border-gray-900 px-8 text-sm font-bold text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#plans"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white shadow-[0_0_10px_rgba(16,185,129,0.2)] px-8 text-sm font-medium text-foreground transition-all hover:bg-emerald-100 hover:-translate-y-0.5"
                >
                  Compare Plans
                </Link>
              </div>

              {/* Trust metrics */}
              <div className="mt-8 grid animate-fade-in grid-cols-2 gap-3 sm:grid-cols-4 [animation-delay:300ms]">
                {[
                  { value: "100+", label: "Active Stores" },
                  { value: "5,000+", label: "Orders Processed" },
                  { value: "₹15L+", label: "Revenue Generated" },
                  { value: "4.9/5", label: "Customer Rating" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-border/40 bg-card/50 px-3 py-3 text-center backdrop-blur-sm sm:px-4 sm:py-4"
                  >
                    <p className="text-lg font-extrabold text-foreground sm:text-xl">
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Billing toggle + currency */}
              <div className="mt-8 animate-fade-in [animation-delay:400ms]">
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">🇮🇳 INR</span>
                  <span className="h-4 w-px bg-border" />
                  <span>🇺🇸 USD</span>
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-3 rounded-full border border-border/40 bg-card p-1">
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
                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-muted-foreground">
                    All paid plans include a 14-day free trial. No credit card required.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="border-b border-border/50">
          <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {plans.map((plan) => {
                const price = annual && plan.annualPrice !== "Custom" ? plan.annualPrice : plan.monthlyPrice
                const usdPrice = annual && plan.usdAnnual !== "Custom" ? plan.usdAnnual : plan.usdPrice
                return (
                  <div
                    key={plan.name}
                    className={`group relative flex flex-col rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      plan.highlighted
                        ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-border/80 hover:shadow-lg"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                          <Sparkles className="h-3 w-3" />
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                      <p className="mt-1 text-[11px] text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-foreground">{price}</span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground">
                          {annual && plan.annualPrice !== "Custom" ? "/yr" : plan.period}
                        </span>
                      )}
                    </div>
                    <p className="mb-4 text-[11px] text-muted-foreground">
                      {usdPrice}{annual && plan.usdAnnual !== "Custom" ? "/yr" : plan.period}
                    </p>
                    {annual && plan.annualPrice !== "Custom" && plan.annualPrice !== "₹0" && (
                      <p className="-mt-3 mb-4 text-[10px] text-emerald-500">
                        ₹{plan.monthlyPrice.replace("₹", "").replace(",", "")}/mo billed annually
                      </p>
                    )}
                    <div className="mb-4 flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <div
                          key={feature.text}
                          className={`flex items-center gap-2 text-[11px] ${
                            feature.included ? "text-muted-foreground" : "text-muted-foreground/40"
                          }`}
                        >
                          <CheckCircle
                            className={`h-3.5 w-3.5 shrink-0 ${
                              feature.included ? "text-primary" : "text-muted-foreground/30"
                            }`}
                          />
                          {feature.text}
                        </div>
                      ))}
                    </div>
                    <PricingSubscribeButton
                      planName={plan.name}
                      cta={plan.cta}
                      highlighted={plan.highlighted}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                FAQ
              </div>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border/80"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
