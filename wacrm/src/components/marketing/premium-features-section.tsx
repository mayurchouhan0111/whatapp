"use client"

import { SectionKicker } from "./section-kicker"
import Link from "next/link"

// Feature definitions – using existing data where possible
const topFeatures = [
  {
    title: "Storefront Builder",
    description: "Create a fully‑branded storefront with product catalog, search and filters.",
    // placeholder screenshot – replace with real image when available
    image: "/feature-logos/storefront.svg",
  },
  {
    title: "WhatsApp Ordering",
    description: "One‑tap order via WhatsApp – customers just hit send.",
    image: "/feature-logos/whatsapp.svg"
  },
]

const bottomFeatures = [
  { title: "CRM Dashboard", description: "Track orders, customers and conversations in one view.", image: "/feature-logos/crm.svg" },
  { title: "Analytics", description: "Revenue, top products and order trends at a glance.", image: "/placeholder-analytics.png" },
  { title: "Automation", description: "Auto‑confirm, delivery updates and follow‑ups via WhatsApp.", image: "/placeholder-automation.png" },
  { title: "Orders", description: "Manage order statuses, inventory and shipping.", image: "/placeholder-orders.png" },
]

export function PremiumFeaturesSection() {
  return (
    <section className="border-t border-gray-100 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <SectionKicker>Features</SectionKicker>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Run Your Entire WhatsApp Store<br />From One Dashboard</h2>
          <p className="mt-4 text-lg text-gray-600">Create your storefront, manage orders, track revenue, and automate customer updates without writing a single line of code.</p>
        </div>

        {/* Top row – large hero cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {topFeatures.map((f) => (
            <div key={f.title} className="group relative bg-white/90 backdrop-blur-lg border border-white/30 rounded-[24px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 mb-4">{f.description}</p>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded" style={{ backgroundImage: `url(${f.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </div>
          ))}
        </div>

        {/* Bottom row – four smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bottomFeatures.map((f) => (
            <div key={f.title} className="group relative bg-white/90 backdrop-blur-lg border border-white/30 rounded-[24px] p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h4 className="text-xl font-medium text-gray-800 mb-2">{f.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{f.description}</p>
              <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded" style={{ backgroundImage: `url(${f.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 transition-all">
            Start Free Trial
            <span className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
