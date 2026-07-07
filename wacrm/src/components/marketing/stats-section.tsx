"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { label: "Active Users", value: 500, suffix: "+" },
  { label: "Messages Processed", value: 50000, suffix: "+", format: "compact" },
  { label: "Countries", value: 12, suffix: "+" },
  { label: "Uptime", value: 99.9, suffix: "%" },
]

function AnimatedStat({ value, suffix, label, format }: { value: number; suffix: string; label: string; format?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1500
          const steps = 30
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(current)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  const display = format === "compact"
    ? count >= 1000 ? `${(count / 1000).toFixed(0)}K` : Math.floor(count).toString()
    : value % 1 === 0 ? Math.floor(count).toString() : count.toFixed(1)

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl font-bold text-foreground sm:text-4xl tabular-nums">
        {display}{suffix}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="border-y border-border/50 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
