"use client"

import { AnimatedCounter } from "./animated-counter"

const stats = [
  { value: 2400, suffix: "+", label: "Active Stores", subtext: "Live on the platform", format: "number" as const },
  { value: 85000, suffix: "+", label: "Orders Processed", subtext: "Via WhatsApp", format: "compact" as const },
  { value: 3.2, suffix: "Cr+", prefix: "₹", label: "Revenue Generated", subtext: "Total GMV", format: "decimal" as const },
  { value: 4.8, suffix: "/5", label: "Store Owner Rating", subtext: "Average satisfaction", format: "decimal" as const },
]

export function ShopStats() {
  return (
    <section className="relative overflow-hidden border-y border-border/30 bg-card/20">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
      <div className="absolute top-0 right-1/3 h-32 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-32 w-64 rounded-full bg-primary/8 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Trusted by Thousands of Store Owners
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Businesses across India use Vbuild CRM to power their WhatsApp stores.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 gap-y-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
