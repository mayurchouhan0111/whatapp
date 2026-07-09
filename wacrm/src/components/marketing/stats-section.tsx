"use client"

import { AnimatedCounter } from "./animated-counter"

const stats = [
  { value: 10000000000, suffix: "+", label: "Messages Processed", format: "compact" as const },
  { value: 99.9, suffix: "%", label: "Historical Uptime", format: "decimal" as const },
  { value: 50000, suffix: "+", label: "Businesses Served", format: "compact" as const },
  { value: 100, suffix: "+", label: "Countries", format: "number" as const },
]

export function StatsSection() {
  return (
    <section className="border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-2 gap-8 gap-y-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
