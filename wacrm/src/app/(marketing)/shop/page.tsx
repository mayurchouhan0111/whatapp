import type { Metadata } from "next"
import Link from "next/link"
import { ShoppingBag, Smartphone, Zap, Globe, BarChart3, ShieldCheck, ArrowRight, CheckCircle, Share2, Store } from "lucide-react"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ShopFlowDiagram } from "@/components/marketing/shop-flow-diagram"

export const metadata: Metadata = {
  title: "WhatsApp Store",
  description: "Launch your WhatsApp Storefront — a mobile-optimized online store connected to WhatsApp. Browse, cart, checkout, and order via WhatsApp in one flow.",
}

const benefits = [
  {
    icon: Zap,
    title: "Launch in Minutes",
    description: "Import your products via CSV, set your WhatsApp number, and your store is live. No coding, no hosting, no hassle.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Experience",
    description: "Every storefront is optimized for mobile. Customers browse, search, and order from their phone effortlessly.",
  },
  {
    icon: Globe,
    title: "Your Own Branded URL",
    description: "Each store gets a unique slug at /shop/your-brand. Share the link anywhere — Instagram, Facebook, or direct messages.",
  },
  {
    icon: BarChart3,
    title: "Order Management Dashboard",
    description: "Track all orders in one place. Update statuses, manage inventory, and chat with customers — all from your CRM dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "UPI & COD Payments",
    description: "Accept UPI payments or offer Cash on Delivery. Delivery fee logic auto-calculates — free above ₹300.",
  },
  {
    icon: Share2,
    title: "Share Anywhere",
    description: "Share your store link on social media, WhatsApp groups, or embed it in your bio. One link, full storefront.",
  },
]

const pricing = [
  {
    plan: "Starter",
    price: "₹999/mo",
    products: "20 products",
    orders: "50 orders/mo",
    features: ["Product catalog", "Category search", "WhatsApp ordering", "Order dashboard", "UPI / COD"],
    highlighted: false,
  },
  {
    plan: "Pro",
    price: "₹2,999/mo",
    products: "150 products",
    orders: "500 orders/mo",
    features: ["Everything in Starter", "CSV bulk import", "Advanced analytics", "Priority support"],
    highlighted: true,
  },
  {
    plan: "Enterprise",
    price: "Custom",
    products: "Unlimited",
    orders: "Unlimited",
    features: ["Everything in Pro", "White-label option", "On-premise deployment", "Custom integrations"],
    highlighted: false,
  },
]

export default function ShopPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/5">
                <Store className="h-3.5 w-3.5" />
                New — WhatsApp Storefront
              </div>
              <h1 className="animate-slide-up text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Launch Your
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  WhatsApp Store
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-balance text-lg text-muted-foreground sm:text-xl [animation-delay:100ms]">
                A mobile-optimized online storefront connected to your WhatsApp.
                Customers browse, add to cart, and order — all through WhatsApp.
              </p>
              <div className="mt-10 flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:200ms]">
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:-translate-y-0.5"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Flow Diagram */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                How It Works
              </div>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                From Browse to Delivery — All on WhatsApp
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Customers place orders in under 30 seconds. You receive them instantly on WhatsApp and your dashboard.
              </p>
            </div>
            <div className="mt-16">
              <ShopFlowDiagram />
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="border-b border-border/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Why Add a Store to Your CRM?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Turn your WhatsApp number into a full-fledged sales channel.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-b border-border/50 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                Pricing
              </div>
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Storefront Plans
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                The WhatsApp Store is included in Starter and above. Free plan does not include store access.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {pricing.map((tier) => (
                <div
                  key={tier.plan}
                  className={`group relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    tier.highlighted
                      ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-border/80 hover:shadow-lg"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                        Best Value
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{tier.plan}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                  </div>
                  <div className="mb-6 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{tier.products}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{tier.orders}</span>
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
                    className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      tier.highlighted
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                        : "border border-border bg-card text-foreground hover:bg-accent hover:-translate-y-0.5"
                    }`}
                  >
                    {tier.plan === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Ready to Launch Your Store?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start with a free CRM account. Add the Store when you&apos;re ready — no setup fees, no contracts.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:-translate-y-0.5"
                >
                  Compare Plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
