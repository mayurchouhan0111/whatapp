import { Zap, Workflow, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

export function AISection() {
  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge><Zap className="h-3 w-3" /> Smart Automations</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
            Put your WhatsApp sales on autopilot
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Let our automation engine handle the repetitive work, so your team can focus on closing deals and building relationships.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
              Rule-based Triggers
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Smart Automations</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Set up instant auto-replies, keyword triggers, and away messages to ensure your customers always get an immediate response.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-semibold">
              <Link href="/signup" className="inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Try Automations <ArrowRight className="h-4 w-5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600">
              No-code Builder
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 shadow-sm">
              <Workflow className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Visual Flow Builder</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Design complex multi-step customer journeys using a simple drag-and-drop canvas. Guide leads from initial hello to final sale automatically.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-semibold">
              <Link href="/signup" className="inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Build Flows <ArrowRight className="h-4 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}