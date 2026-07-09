"use client"

import { useState } from "react"
import { HeadphonesIcon, MessageSquare, Bot, Users, Globe, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const STEPS = ["INQUIRY", "RESPOND", "ESCALATE", "RESOLVE"]
const TAGS = ["MULTILINGUAL", "CONTEXTUAL", "EMPATHETIC"]

export function SupportSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div>
            <SectionBadge><HeadphonesIcon className="h-3 w-3" /> Wati for Support</SectionBadge>
            <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
              Delight customers and handle questions at scale — Work in perfect harmony with Vbuild AI
            </h2>

            <ul className="mt-6 space-y-3">
              {[
                "Provide instant, accurate answers grounded in your knowledge base 24/7",
                "Intelligently route complex conversations to the right human agent",
                "Collaborate better with a unified Team Inbox for all messaging platforms",
                "Enhance support operations with data-driven insights on performance",
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
              {["40% Less Workload", "80% FAQs Resolved by AI", "40% Faster Resolutions"].map((m) => (
                <span key={m} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                  {m}
                </span>
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Test AI Support <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-gray-400 font-medium">Support Inbox</span>
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

                {/* Chat messages */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-[8px] font-bold text-emerald-600">P</div>
                    <div className="rounded-xl rounded-tl-none bg-gray-100 px-3.5 py-2.5">
                      <p className="text-xs text-gray-700">Hi! I need help with my recent order</p>
                      <p className="text-[10px] text-gray-400 mt-1">2m ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 text-[8px] font-bold text-white">AI</div>
                    <div className="rounded-xl rounded-tr-none bg-emerald-500 px-3.5 py-2.5">
                      <p className="text-xs text-white">I can help with that! Let me check your order status.</p>
                      <p className="text-[10px] text-emerald-100 mt-1">Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
