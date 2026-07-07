import Link from "next/link"
import {
  MessageSquare,
  Users,
  GitBranch,
  Radio,
  Zap,
  Workflow,
  Shield,
  BarChart3,
  Phone,
  UsersRound,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Shared Inbox",
    description: "Multiple agents, one number. Assign conversations, leave notes, track status — all in real time.",
  },
  {
    icon: Users,
    title: "Contacts & Tags",
    description: "Rich contact profiles with custom fields, tags, CSV import, and automatic deduplication.",
  },
  {
    icon: GitBranch,
    title: "Sales Pipelines",
    description: "Kanban deal tracking connected to WhatsApp conversations. Drag, drop, close.",
  },
  {
    icon: Radio,
    title: "Broadcasts",
    description: "Send Meta-approved template messages with delivery tracking, read receipts, and variables.",
  },
  {
    icon: Zap,
    title: "Automations",
    description: "Trigger actions on inbound messages, keywords, or schedules. Conditional branches, webhooks, tags.",
  },
  {
    icon: Workflow,
    title: "Visual Flows",
    description: "No-code flow builder — design customer journeys with drag-and-drop nodes.",
  },
]

const stats = [
  { label: "Active Users", value: "500+" },
  { label: "Messages Processed", value: "50K+" },
  { label: "Countries", value: "12+" },
  { label: "Uptime", value: "99.9%" },
]

const tiers = [
  {
    name: "Free",
    price: "₹0",
    period: "/mo",
    description: "For solo entrepreneurs and testing.",
    features: ["1 user", "500 contacts", "500 conversations/mo", "100 broadcasts/mo", "1 WhatsApp number"],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₹999",
    period: "/mo",
    description: "For small teams ready to grow.",
    features: [
      "3 agents",
      "5,000 contacts",
      "5,000 conversations/mo",
      "1,000 broadcasts/mo",
      "Flows & Automations",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "/mo",
    description: "For growing businesses at scale.",
    features: [
      "10 agents",
      "50,000 contacts",
      "50,000 conversations/mo",
      "10,000 broadcasts/mo",
      "3 WhatsApp numbers",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
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

export default function LandingPage() {
  return (
    <>
      <Header />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              WhatsApp CRM, Built for Growth
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn WhatsApp Conversations
              <br />
              <span className="text-primary">Into Revenue</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Shared inbox, contact management, sales pipelines, broadcasts, and automations —
              all connected to your WhatsApp Business API.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 sm:w-auto"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required. Free tier included.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Sell on WhatsApp
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From shared inbox to automations — a complete CRM built on the official WhatsApp Business API.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Vbuild */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Why choose Vbuild CRM?
              </h2>
              <ul className="mt-8 space-y-4">
                {[
                  "Official WhatsApp Business API — not unofficial hacks",
                  "Self-hosted on your Supabase — full data ownership",
                  "Multi-agent shared inbox with role-based access",
                  "No-code automations and visual flow builder",
                  "Public REST API for custom integrations",
                  "AES-256-GCM encrypted tokens — enterprise-grade security",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Enterprise Security</p>
                    <p className="text-xs text-muted-foreground">SOC2-level data protection</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { icon: Phone, text: "AES-256-GCM encrypted tokens" },
                    { icon: UsersRound, text: "Row-Level Security on every table" },
                    { icon: BarChart3, text: "HMAC-verified webhook signatures" },
                    { icon: Shield, text: "Rate limiting & CSP headers" },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.text} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{item.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when you grow. No hidden fees.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 ${
                  tier.highlighted
                    ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Enterprise plan available for large teams.{" "}
            <Link href="/pricing" className="text-primary hover:underline">
              View full pricing details →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Grow on WhatsApp?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join 500+ businesses using Vbuild CRM. Free tier — no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
