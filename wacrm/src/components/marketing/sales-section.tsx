"use client"

import { useState } from "react"
import { BarChart3, MessageSquare, Bot, Users, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const STEPS = ["ENGAGE", "QUALIFY", "ASSIGN", "WIN"]
const TAGS = ["See Offer", "Follow-up scheduled", "View Catalog", "Rate Us", "Book Appointment"]

export function SalesSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
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
                <span className="ml-3 text-xs text-gray-400 font-medium">Deal Pipeline</span>
              </div>

              <div className="p-5">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-4">
                  {STEPS.map((step, i) => (
                    <button
                      key={step}
                      onClick={() => setActiveStep(i)}
                      className={`flex-1 py-2 text-[10px] font-semibold tracking-wider transition-colors ${
                        i === activeStep
                          ? "border-b-2 border-emerald-500 text-emerald-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {TAGS.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bot message */}
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-700">Aibo (bot)</span>
                  </div>
                  <p className="text-xs text-emerald-800/80">
                    Collecting qualification information before confirming meeting.
                  </p>
                </div>

                {/* Assignment */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-[8px] font-bold text-emerald-600">K</div>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium text-gray-900">Ticket routed to Keith</p>
                      <p className="text-[9px] text-gray-500">by Aibo(bot) for demo scheduling</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div>
            <SectionBadge><BarChart3 className="h-3 w-3" /> Wati for Sales</SectionBadge>
            <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
              Accelerate pipeline, increase conversions, and shorten sales cycles — all on chat
            </h2>

            <ul className="mt-6 space-y-3">
              {[
                "One single workspace for all your sales reps to collaborate, communicate, and convert leads",
                "Ensure no sales-ready leads slip through the cracks with real-time, instant qualification",
                "Manage high lead volume easily on WhatsApp; use AI to qualify leads and hand off to reps",
                "Monitor customer chats easily and ensure high-quality experience to avoid reputation risks",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {["30% Shorter Sales Cycle", "3X Faster Responses", "20% Revenue Growth"].map((m) => (
                <span key={m} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                  {m}
                </span>
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Chat with a Rep <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
