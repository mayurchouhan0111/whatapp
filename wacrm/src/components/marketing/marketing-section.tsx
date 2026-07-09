"use client"

import { useState } from "react"
import { TrendingUp, Target, MessageSquare, Zap, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const TABS = ["AD", "CHAT", "ENGAGE", "CONVERT"]

export function MarketingSection() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section className="border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div>
            <SectionBadge><TrendingUp className="h-3 w-3" /> Wati for Marketing</SectionBadge>
            <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
              Acquire, engage, and qualify leads with personalized campaigns at scale
            </h2>

            <ul className="mt-6 space-y-3">
              {[
                "Convert every touchpoint, from links to offline interaction and ads, into conversations instantly",
                "Improve attribution, easily retarget, and increase ROI with Meta and Google ads that click to WhatsApp",
                "Auto-magically engage your users with AI-fueled, human-like conversations",
                "Stay on top with powerful insights to improve your messaging, campaign, and ad performance",
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

            {/* Metrics */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["4X Lower CACs", "3X More ROI", "85% Higher Response Rate"].map((m) => (
                <span key={m} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                  {m}
                </span>
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              See it in Action <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: tabbed mockup */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
              {/* Tab bar */}
              <div className="flex border-b border-gray-100">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 py-3 text-xs font-semibold tracking-wider transition-colors ${
                      i === activeTab
                        ? "border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-900">Campaign Performance</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center">
                    <p className="text-xs text-gray-500">Sent</p>
                    <p className="text-2xl font-bold text-gray-900">12.4K</p>
                    <p className="text-[10px] text-emerald-600">+18% vs last campaign</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center">
                    <p className="text-xs text-gray-500">Conversion</p>
                    <p className="text-2xl font-bold text-gray-900">24%</p>
                    <p className="text-[10px] text-emerald-600">+5% vs last campaign</p>
                  </div>
                </div>

                <div className="mt-3 flex h-16 items-end gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  {[35, 50, 65, 45, 80, 55, 70, 60, 75, 40, 85, 65].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
