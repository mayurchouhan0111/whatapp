"use client"

import { ArrowRight } from "lucide-react"
import { SectionBadge } from "./section-badge"
import { steps } from "./premium-workflow-steps"



export function PremiumWorkflowSection() {

  return (
    <section className="relative py-20 bg-white">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-100/30 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <SectionBadge><ArrowRight className="h-3 w-3" /> Order Journey</SectionBadge>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">From Storefront to Delivery in Seconds</h2>
          <p className="mt-4 text-lg text-gray-600">Customers browse, order through WhatsApp, and every order appears instantly inside your CRM.</p>
        </div>
        <div className="relative">

          {/* Premium workflow cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.id} className="group relative bg-white/90 backdrop-blur-lg border border-white/30 rounded-[24px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-medium">{String(step.id).padStart(2, '0')}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="mb-4 text-sm text-gray-600">{step.description}</p>
                {step.mockup}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
