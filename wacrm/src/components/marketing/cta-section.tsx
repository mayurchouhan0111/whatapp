import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal delay={100} direction="up" distance={24}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Get Started
            </div>

            <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl tracking-tight">
              Take Control of Your WhatsApp Sales Pipeline
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
              Join 500+ businesses using Vbuild CRM and get a complete overview of your sales, support, and customer data — all from one powerful dashboard.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="btn-primary h-12"
              >
                Try for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
              {[
                "No credit card",
                "14-day free trial",
                "Cancel anytime",
                "Free tier included",
              ].map((benefit, idx) => (
                <div 
                  key={benefit} 
                  className="flex items-center gap-1.5 hover:text-gray-600 transition-colors animate-fade-in"
                  style={{ animationDelay: `${400 + idx * 85}ms` }}
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  {benefit}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
