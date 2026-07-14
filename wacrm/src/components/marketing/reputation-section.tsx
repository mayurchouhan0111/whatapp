"use client"

import { useState } from "react"
import { Star, MessageSquare, QrCode, BarChart3, ArrowRight, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"
import Link from "next/link"
import { SectionKicker } from "./section-kicker"

const STEPS = ["CHECK-IN", "REVIEW", "GATE", "GROW"]
const REVIEW_TAGS = ["Google Review", "Private Feedback", "QR Check-in", "Analytics"]

export function ReputationSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-gray-400 font-medium">Review Feedback Flow</span>
              </div>

              <div className="p-5">
                {/* Steps */}
                <div className="flex border-b border-gray-100 mb-4">
                  {STEPS.map((step, i) => (
                    <button
                      key={step}
                      onClick={() => setActiveStep(i)}
                      className={`flex-1 py-2 text-[10px] font-semibold tracking-wider transition-colors ${
                        i === activeStep
                          ? "border-b-2 border-amber-500 text-amber-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {REVIEW_TAGS.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Mock review card */}
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white text-xs font-bold">P</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Priya Sharma</p>
                        <p className="text-[9px] text-gray-500">Just rated</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">&ldquo;Great service! The team was very responsive and helpful.&rdquo;</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px]">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 flex items-center gap-1">
                      <ThumbsUp className="h-2.5 w-2.5" /> Google Review Sent
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
                    <p className="text-[18px] font-bold text-gray-900">4.8★</p>
                    <p className="text-[9px] text-gray-500">Avg Rating</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
                    <p className="text-[18px] font-bold text-gray-900">92%</p>
                    <p className="text-[9px] text-gray-500">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div>
            <SectionKicker>Reputation</SectionKicker>
            <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
              Collect Google reviews, manage reputation, and turn feedback into growth
            </h2>

            <ul className="mt-6 space-y-3">
              {[
                "QR code check-in at your storefront — customers scan, rate, and review in seconds",
                "Smart gating: positive reviews go to Google, negative feedback stays private for you to act on",
                "Automated WhatsApp follow-ups that gently nudge customers to leave a Google review",
                "Real-time analytics dashboard with rating distribution, trends, and actionable insights",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {["4.8★ Avg Rating", "40% More Google Reviews", "95% Negative Caught"].map((m) => (
                <span key={m} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
                  {m}
                </span>
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700"
            >
              Start Collecting Reviews <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
