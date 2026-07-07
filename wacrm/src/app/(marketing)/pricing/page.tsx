import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, ArrowRight, HelpCircle, MessageSquare } from "lucide-react"

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

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Vbuild CRM</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>Vbuild CRM</span>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Vbuild CRM. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default function PricingPage() {
  return (
    <div>
      <Header />
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you grow. No hidden fees, no surprises.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
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
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  plan.highlighted
                    ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
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
                  {plan.usdPrice}
                  {plan.period}
                </p>
                <div className="mb-6 flex-1 space-y-2">
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
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                  {plan.name === "Enterprise" ? null : <ArrowRight className="h-4 w-4" />}
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
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
