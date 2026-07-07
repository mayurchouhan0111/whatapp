import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, ArrowRight, HelpCircle } from "lucide-react"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Vbuild CRM. Start free, upgrade when you grow.",
}

const plans = [
  {
    name: "Free",
    price: "₹0",
    usdPrice: "$0",
    period: "/mo",
    description: "For solo entrepreneurs testing the waters.",
    features: [
      { text: "1 user (solo)", included: true },
      { text: "Up to 500 contacts", included: true },
      { text: "500 conversations/month", included: true },
      { text: "100 broadcasts/month", included: true },
      { text: "1 WhatsApp number", included: true },
      { text: "5 custom fields", included: true },
      { text: "WhatsApp Storefront", included: false },
      { text: "Flows & Automations", included: false },
      { text: "API access", included: false },
      { text: "Advanced reports", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₹999",
    usdPrice: "$19",
    period: "/mo",
    description: "For small teams ready to grow.",
    popular: true,
    features: [
      { text: "Up to 3 agents", included: true },
      { text: "Up to 5,000 contacts", included: true },
      { text: "5,000 conversations/month", included: true },
      { text: "1,000 broadcasts/month", included: true },
      { text: "1 WhatsApp number", included: true },
      { text: "20 custom fields", included: true },
      { text: "WhatsApp Storefront (20 products, 50 orders/mo)", included: true },
      { text: "Flows & Automations", included: true },
      { text: "API access", included: false },
      { text: "Advanced reports", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹2,999",
    usdPrice: "$49",
    period: "/mo",
    description: "For growing businesses at scale.",
    features: [
      { text: "Up to 10 agents", included: true },
      { text: "Up to 50,000 contacts", included: true },
      { text: "50,000 conversations/month", included: true },
      { text: "10,000 broadcasts/month", included: true },
      { text: "3 WhatsApp numbers", included: true },
      { text: "Unlimited custom fields", included: true },
      { text: "WhatsApp Storefront (150 products, 500 orders/mo)", included: true },
      { text: "Flows & Automations", included: true },
      { text: "API access", included: true },
      { text: "Advanced reports", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    usdPrice: "Custom",
    period: "",
    description: "For large teams with custom needs.",
    features: [
      { text: "Unlimited agents", included: true },
      { text: "Unlimited contacts", included: true },
      { text: "Unlimited conversations", included: true },
      { text: "Custom broadcast limits", included: true },
      { text: "Unlimited WhatsApp numbers", included: true },
      { text: "Unlimited custom fields", included: true },
      { text: "WhatsApp Storefront (Unlimited products/orders)", included: true },
      { text: "Flows & Automations", included: true },
      { text: "API access", included: true },
      { text: "White-label option", included: true },
      { text: "On-premise deployment", included: true },
    ],
    cta: "Contact Us",
    href: "mailto:sales@vbuildcrm.com",
    highlighted: false,
  },
]

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime. Changes take effect immediately.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "All paid plans come with a 14-day free trial. No credit card required.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI (India), and bank transfers for annual plans.",
  },
  {
    q: "Can I use my own WhatsApp Business number?",
    a: "Yes. Vbuild CRM works with any WhatsApp Business API account. Connect your existing number.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted at rest and in transit. Tokens are AES-256-GCM encrypted. We use Row-Level Security on every database table.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes. Annual plans are 2 months free (pay for 10 months, get 12).",
  },
]

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Page header */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl">
                Simple, <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Transparent</span> Pricing
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free. Upgrade when you grow. No hidden fees, no surprises.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">🇮🇳 INR</span>
              <span className="h-4 w-px bg-border" />
              <span>🇺🇸 USD</span>
            </div>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-muted-foreground">
                Plans are configured by your admin. Contact sales to subscribe.
              </span>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="border-b border-border/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    plan.highlighted
                      ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-border/80 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mb-6 text-xs text-muted-foreground">
                    {plan.usdPrice}{plan.period}
                  </p>
                  <div className="mb-6 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <div
                        key={feature.text}
                        className={`flex items-center gap-2 text-sm ${
                          feature.included ? "text-muted-foreground" : "text-muted-foreground/40"
                        }`}
                      >
                        <CheckCircle
                          className={`h-4 w-4 shrink-0 ${
                            feature.included ? "text-primary" : "text-muted-foreground/30"
                          }`}
                        />
                        {feature.text}
                      </div>
                    ))}
                  </div>
                  <Link
                    href={plan.href}
                    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                        : "border border-border bg-card text-foreground hover:bg-accent hover:-translate-y-0.5"
                    }`}
                  >
                    {plan.cta}
                    {plan.name !== "Enterprise" && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </div>
              ))}
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
