"use client"

import Link from "next/link"
import { ArrowRight, MessageSquare, BarChart3, Users, Star, HeadphonesIcon, TrendingUp } from "lucide-react"
import { useState } from "react"
import { ScrollReveal } from "./scroll-reveal"

const TABS = [
  {
    id: "marketing",
    label: "Marketing",
    icon: TrendingUp,
    content: {
      title: "Acquire, engage, and qualify leads with personalized campaigns at scale",
      points: [
        "Convert every touchpoint into meaningful conversations instantly",
        "Improve attribution and increase ROI with Click to WhatsApp ads",
        "Auto-magically engage users with AI-fueled conversations",
        "Powerful insights to improve messaging and campaign performance",
      ],
      metrics: ["4X Lower CACs", "3X More ROI", "85% Higher Response"],
      cta: "See it in Action",
    },
  },
  {
    id: "sales",
    label: "Sales",
    icon: BarChart3,
    content: {
      title: "Accelerate pipeline, increase conversions, and shorten sales cycles — all on chat",
      points: [
        "One workspace for reps to collaborate, communicate, and convert",
        "Real-time instant qualification on your favorite messaging channel",
        "AI-qualified leads handed off to reps automatically",
        "Monitor chats and ensure high-quality customer experience",
      ],
      metrics: ["30% Shorter Sales Cycle", "3X Faster Responses", "20% Revenue Growth"],
      cta: "Chat with a Rep",
    },
  },
  {
    id: "support",
    label: "Support",
    icon: HeadphonesIcon,
    content: {
      title: "Delight customers and handle questions at scale with AI-powered support",
      points: [
        "Instant, accurate answers grounded in your knowledge base 24/7",
        "Intelligently route complex conversations to the right agent",
        "Unified Team Inbox for all messaging platforms",
        "Data-driven insights on response time and agent performance",
      ],
      metrics: ["40% Less Workload", "80% FAQs Solved by AI", "40% Faster Resolutions"],
      cta: "Test AI Support",
    },
  },
]

export function HeroSection() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const tab = TABS.find((t) => t.id === activeTab)!

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <ScrollReveal delay={100} direction="down" distance={16}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              The #1 WhatsApp CRM Platform
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} direction="up" distance={20}>
            <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
              The #1{" "}
              <span className="inline-block bg-[#0fe875] border-2 border-gray-900 px-3 py-1 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] -rotate-1 hover:rotate-0 transition-transform duration-300">
                WhatsApp
              </span>
              <br />
              <span className="inline-block bg-[#0fe875] border-2 border-gray-900 px-3 py-1 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] rotate-1 mt-2 hover:rotate-0 transition-transform duration-300">
                growth
              </span>{" "}
              platform
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={300} direction="up" distance={20}>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-gray-500 sm:text-lg">
              From the first marketing touchpoint through the sales cycle to ongoing customer success, Vbuild CRM drives faster ROI with an easy-to-use, scalable platform.
            </p>
          </ScrollReveal>

          {/* Social proof */}
          <ScrollReveal delay={400} direction="up" distance={16}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex -space-x-2">
                  {["PK", "RM", "AG", "SN"].map((initials) => (
                    <div key={initials} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-emerald-600 text-[8px] font-bold text-white shadow-sm hover:scale-110 transition-transform cursor-default">
                      {initials}
                    </div>
                  ))}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[8px] font-bold text-emerald-600 shadow-sm">
                    +500
                  </div>
                </div>
                <span className="font-medium text-gray-700">Trusted by 500+ businesses</span>
              </div>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 text-gray-500">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 hover:scale-125 transition-transform" />
                  ))}
                </div>
                <span className="font-medium text-gray-700">4.6/5</span>
                <span className="text-gray-400">on G2</span>
              </div>
            </div>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={500} direction="up" distance={20}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="btn-primary h-12"
              >
                Try for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Tabbed interface */}
        <ScrollReveal delay={600} direction="up" distance={24}>
          <div className="mx-auto mt-16 max-w-6xl">
            {/* Tab buttons */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                {TABS.map((t) => {
                  const Icon = t.icon
                  const isActive = activeTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab content with animated switching */}
            <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div key={`text-${activeTab}`} className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
                  {tab.content.title}
                </h2>
                <ul className="mt-6 space-y-3">
                  {tab.content.points.map((point, index) => (
                    <li 
                      key={point} 
                      className="flex items-start gap-3 text-sm text-gray-600 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Metrics badges */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {tab.content.metrics.map((m, index) => (
                    <span 
                      key={m} 
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:scale-105 hover:bg-emerald-100/50 transition-transform duration-200 cursor-default animate-fade-in"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <Link
                  href="/signup"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 group"
                >
                  {tab.content.cta}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right mockup with animated switching */}
              <div key={`mockup-${activeTab}`} className="relative animate-fade-in">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-100/50 via-white to-transparent blur-2xl pointer-events-none" />
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                  <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    <span className="ml-3 text-xs text-gray-400 font-medium">dashboard.vbuildcrm.com</span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{tab.label} Dashboard</span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 animate-pulse-soft">Live</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Leads", value: "128", change: "+12%", color: "text-emerald-600" },
                        { label: "Conversions", value: "34", change: "+8%", color: "text-blue-600" },
                        { label: "Revenue", value: "₹48K", change: "+22%", color: "text-amber-600" },
                      ].map((item, idx) => (
                        <div 
                          key={item.label} 
                          className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center animate-fade-in"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">{item.change}</p>
                        </div>
                      ))}
                    </div>

                    {activeTab === "marketing" && (
                      <div className="mt-4 flex h-16 items-end gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                        {[45, 65, 50, 80, 55, 90, 70].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400 animate-slide-up" 
                            style={{ 
                              height: `${h}%`,
                              animationDelay: `${i * 40}ms`,
                              animationDuration: '0.5s'
                            }} 
                          />
                        ))}
                      </div>
                    )}
                    {activeTab === "sales" && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          { stage: "New Leads", count: "18", value: "₹12K" },
                          { stage: "Qualified", count: "7", value: "₹18K" },
                          { stage: "Closed", count: "23", value: "₹24K" },
                        ].map((s, i) => (
                          <div 
                            key={s.stage} 
                            className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center animate-fade-in"
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <p className="text-[10px] text-gray-500">{s.stage}</p>
                            <p className="text-lg font-bold text-gray-900">{s.count}</p>
                            <p className="text-[10px] text-gray-500">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "support" && (
                      <div className="mt-4 space-y-2">
                        {[
                          { name: "Priya Sharma", msg: "Need help with my order #ORD-0042", time: "2m ago" },
                          { name: "Rahul Verma", msg: "When will my delivery arrive?", time: "15m ago" },
                        ].map((chat, i) => (
                          <div 
                            key={chat.name} 
                            className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-[10px] font-bold text-emerald-600">
                              {chat.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-900">{chat.name}</span>
                                <span className="text-[10px] text-gray-400">{chat.time}</span>
                              </div>
                              <p className="truncate text-[11px] text-gray-500">{chat.msg}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
