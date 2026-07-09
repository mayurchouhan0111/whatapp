'use client'

import { useEffect, useRef } from 'react'

const steps = [
  { title: 'Browse Storefront', description: 'Explore the product catalog on your storefront.' },
  { title: 'Add Products', description: 'Add items to the cart and customize options.' },
  { title: 'Checkout', description: 'Customer completes checkout and receives an order summary.' },
  { title: 'WhatsApp Order', description: 'Order details are sent to your WhatsApp channel instantly.' },
  { title: 'CRM Dashboard', description: 'The order appears in the Vbuild CRM dashboard for tracking.' },
  { title: 'Confirm & Deliver', description: 'Confirm payment and ship the product to the customer.' },
]

export function WorkflowSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Simple scroll‑into‑view animation – add ‘opacity-0’ and transition to ‘opacity-100’ when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).classList.add('opacity-100', 'translate-y-0')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.2 }
    )
    const cards = containerRef.current?.querySelectorAll('.step-card')
    cards?.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative overflow-hidden py-24 bg-white" ref={containerRef}>
      {/* Emerald curved connection line */}
      <svg
        className="absolute inset-0 pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <path
          d="M100 150 C300 100, 500 300, 700 250 S1100 400, 1150 350"
          stroke="#10B981"
          strokeWidth="4"
          fill="none"
          className="stroke-emerald-500 animate-pulse"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl">
          Seamless Order Workflow
        </h2>
        <div className="grid grid-cols-1 gap-24 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-card opacity-0 translate-y-8 transition-all duration-700 ${i % 2 === 0 ? 'md:col-start-1' : 'md:col-start-2'} lg:col-span-1`}
            >
              <div className="mx-auto w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur-lg border border-white/30 p-8 shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <span className="text-lg font-medium">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
