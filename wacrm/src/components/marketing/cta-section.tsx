import Link from "next/link"
import { ArrowRight, MessageSquare, CheckCircle } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            Get Started
          </div>

          <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Take Control of Your WhatsApp Sales Pipeline
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Join 500+ businesses using Vbuild CRM and get a complete overview of your sales, support, and customer data — all from one powerful dashboard.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0fe875] border-2 border-gray-900 px-8 text-sm font-bold text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            >
              Try for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              No credit card
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              14-day free trial
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              Free tier included
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
