"use client"

import { useState } from "react"
import { HeadphonesIcon, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"
import { ScrollReveal } from "./scroll-reveal"

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
            <ScrollReveal delay={100} direction="up" distance={20}>
              <SectionBadge>
                <HeadphonesIcon className="h-3 w-3" /> Wati for Support
              </SectionBadge>
              <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
                Delight customers and handle questions at scale — Work in perfect harmony with Vbuild AI
              </h2>
            </ScrollReveal>

            <ul className="mt-6 space-y-3">
              {[
                "Provide instant, accurate answers grounded in your knowledge base 24/7",
                "Intelligently route complex conversations to the right human agent",
                "Collaborate better with a unified Team Inbox for all messaging platforms",
                "Enhance support operations with data-driven insights on performance",
              ].map((point, index) => (
                <li key={point}>
                  <ScrollReveal delay={180 + index * 60} direction="up" distance={10}>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform hover:scale-110">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {point}
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>

            <ScrollReveal delay={450} direction="up" distance={15}>
              <div className="mt-6 flex flex-wrap gap-2">
                {["40% Less Workload", "80% FAQs Resolved by AI", "40% Faster Resolutions"].map((m) => (
                  <span 
                    key={m} 
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:scale-105 hover:bg-emerald-100/50 transition-all duration-200 cursor-default"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500} direction="up" distance={15}>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 group"
              >
                Test AI Support <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Right mockup */}
          <div>
            <ScrollReveal delay={300} direction="up" distance={25}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-transparent blur-xl pointer-events-none" />
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                  <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3 bg-gray-50/20">
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
                          className={`flex-1 py-2 text-[10px] font-semibold tracking-wider transition-all duration-300 ${
                            i === activeStep
                              ? "border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/20"
                          }`}
                        >
                          {step}
                        </button>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {TAGS.map((tag, idx) => (
                        <span 
                          key={tag} 
                          className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-medium text-gray-600 hover:border-emerald-500/20 hover:text-emerald-600 hover:bg-white transition-all cursor-default animate-fade-in"
                          style={{ animationDelay: `${idx * 40}ms` }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Chat messages with transition */}
                    <div key={activeStep} className="space-y-3 animate-fade-in min-h-[120px] flex flex-col justify-center">
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-[8px] font-bold text-emerald-600">
                          {activeStep === 2 ? "⚠️" : "P"}
                        </div>
                        <div className="rounded-xl rounded-tl-none bg-gray-100 px-3.5 py-2.5 max-w-[80%] hover:shadow-sm transition-shadow">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {activeStep === 0 && "Hi! I need help with my recent order."}
                            {activeStep === 1 && "What details are required for refunding order #ORD-99?"}
                            {activeStep === 2 && "This issue is urgent. I need to talk to a manager immediately."}
                            {activeStep === 3 && "Thank you, that solved my issue perfectly!"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">2m ago</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 text-[8px] font-bold text-white">
                          {activeStep === 2 ? "🧑‍💼" : "AI"}
                        </div>
                        <div className="rounded-xl rounded-tr-none bg-emerald-500 px-3.5 py-2.5 max-w-[80%] shadow-md shadow-emerald-500/5">
                          <p className="text-xs text-white leading-relaxed">
                            {activeStep === 0 && "I can help with that! Let me check your order status."}
                            {activeStep === 1 && "Please provide your billing email and order ID to initiate the check."}
                            {activeStep === 2 && "Routing this ticket to Manager Keith. Connecting in 30 seconds..."}
                            {activeStep === 3 && "You're very welcome! Let me know if you need anything else."}
                          </p>
                          <p className="text-[10px] text-emerald-100 mt-1">Just now</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
