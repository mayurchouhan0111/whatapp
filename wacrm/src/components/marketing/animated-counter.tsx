"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  subtext?: string
  format?: "number" | "compact" | "decimal"
}

export function AnimatedCounter({ value, suffix = "", prefix = "", label, subtext, format = "number" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const steps = 40
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  let display: string
  if (format === "compact") {
    display = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : Math.floor(count).toString()
  } else if (format === "decimal") {
    display = count.toFixed(1)
  } else {
    display = Math.floor(count).toString()
  }

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl tabular-nums">
        {prefix}{display}{suffix}
      </span>
      <span className="mt-2 text-sm font-medium text-muted-foreground">{label}</span>
      {subtext && (
        <span className="mt-0.5 text-xs text-muted-foreground/60">{subtext}</span>
      )}
    </div>
  )
}
