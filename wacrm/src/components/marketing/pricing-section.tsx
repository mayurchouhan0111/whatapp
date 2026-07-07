import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"

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
    features: ["3 agents", "5,000 contacts", "5,000 conversations/mo", "1,000 broadcasts/mo", "Flows & Automations"],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "/mo",
    description: "For growing businesses at scale.",
    features: ["10 agents", "50,000 contacts", "50,000 conversations/mo", "10,000 broadcasts/mo", "3 WhatsApp numbers", "API access", "Priority support"],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Pricing
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
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
              className={`group relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                tier.highlighted
                  ? "border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-border/80 hover:shadow-lg"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                    : "border border-border bg-card text-foreground hover:bg-accent hover:-translate-y-0.5"
                }`}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Enterprise plan available for large teams.{" "}
          <Link href="/pricing" className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
            View full pricing details &rarr;
          </Link>
        </p>
      </div>
    </section>
  )
}
