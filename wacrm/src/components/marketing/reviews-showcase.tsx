"use client"

import { useState } from "react"
import { BarChart3, Star, MessageSquare, QrCode, TrendingUp, Bell, CheckCircle } from "lucide-react"
import { SectionKicker } from "./section-kicker"

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    id: "requests",
    label: "Requests",
    icon: MessageSquare,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
]

const tabContent = {
  dashboard: {
    title: "Real-Time Reputation Dashboard",
    description: "See your average rating, review count, and trends at a glance. Track weekly and monthly review volume.",
    highlights: [
      { icon: Star, text: "Average rating & total reviews" },
      { icon: TrendingUp, text: "Review trends over time" },
      { icon: Bell, text: "Recent review notifications" },
    ],
    mockup: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Avg Rating", value: "4.8", color: "text-amber-500", sub: "/5" },
            { label: "Total Reviews", value: "342", color: "text-primary", sub: "all time" },
            { label: "This Month", value: "28", color: "text-emerald-500", sub: "+40% vs last" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/30 bg-card p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}<span className="text-xs text-muted-foreground">{s.sub}</span></p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/30 bg-card p-3">
          <p className="mb-2 text-xs font-medium text-foreground">Recent Reviews</p>
          <div className="space-y-2">
            {[
              { name: "Priya S.", rating: 5, text: "Excellent service! Will visit again" },
              { name: "Rahul V.", rating: 4, text: "Good quality, fast delivery" },
              { name: "Ananya G.", rating: 5, text: "Very professional team" },
            ].map((r) => (
              <div key={r.name} className="flex items-start gap-2 text-[11px]">
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
                  ))}
                </div>
                <div>
                  <span className="font-medium text-foreground">{r.name}</span>
                  <span className="text-muted-foreground">: &ldquo;{r.text}&rdquo;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  reviews: {
    title: "Complete Review Management",
    description: "View all reviews in one place. Filter by rating, date, or customer. Reply to reviews directly from your dashboard.",
    highlights: [
      { icon: Star, text: "View all reviews with ratings" },
      { icon: MessageSquare, text: "WhatsApp alerts for new reviews" },
      { icon: CheckCircle, text: "Track response status" },
    ],
    mockup: (
      <div className="space-y-2">
        {[
          { name: "Priya Sharma", rating: 5, text: "Amazing service, highly recommend!", time: "2 hours ago", initials: "PS", gradient: "from-violet-500/20 to-violet-500/5" },
          { name: "Rahul Verma", rating: 4, text: "Good products, quick delivery", time: "1 day ago", initials: "RV", gradient: "from-amber-500/20 to-amber-500/5" },
          { name: "Ananya Gupta", rating: 5, text: "Very happy with the quality", time: "2 days ago", initials: "AG", gradient: "from-emerald-500/20 to-emerald-500/5" },
        ].map((r) => (
          <div key={r.name} className="flex items-start gap-3 rounded-xl border border-border/30 bg-card p-3 transition-colors hover:bg-accent/50">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${r.gradient} text-xs font-bold`}>
              {r.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <span className="text-[10px] text-muted-foreground">{r.time}</span>
              </div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">&ldquo;{r.text}&rdquo;</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  requests: {
    title: "Automated Review Requests",
    description: "Send review requests via WhatsApp after a purchase or service. Customers tap the link and leave a review in under 10 seconds.",
    highlights: [
      { icon: MessageSquare, text: "Send requests via WhatsApp" },
      { icon: QrCode, text: "Generate QR review posters" },
      { icon: TrendingUp, text: "Track request success rate" },
    ],
    mockup: (
      <div className="space-y-2">
        {[
          { customer: "Priya Sharma", service: "Hair Styling", status: "Review Left", date: "Today", statusColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
          { customer: "Rahul Verma", service: "Facial Treatment", status: "Sent — Awaiting", date: "Yesterday", statusColor: "text-amber-500", bgColor: "bg-amber-500/10" },
          { customer: "Sneha Reddy", service: "Manicure", status: "Sent — Awaiting", date: "2 days ago", statusColor: "text-amber-500", bgColor: "bg-amber-500/10" },
        ].map((r) => (
          <div key={r.customer} className="flex items-center justify-between rounded-xl border border-border/30 bg-card p-3 transition-colors hover:bg-accent/50">
            <div>
              <p className="text-sm font-medium text-foreground">{r.customer}</p>
              <p className="text-xs text-muted-foreground">{r.service} · {r.date}</p>
            </div>
            <span className={`rounded-full ${r.bgColor} px-2.5 py-0.5 text-[10px] font-medium ${r.statusColor}`}>{r.status}</span>
          </div>
        ))}
        <div className="mt-2 rounded-xl bg-primary/5 p-2.5 text-center">
          <p className="text-xs font-medium text-primary">68% review request success rate</p>
        </div>
      </div>
    ),
  },
}

export function ReviewsShowcase() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const current = tabContent[activeTab as keyof typeof tabContent]

  return (
    <section className="border-b border-border/40 bg-card/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Product</SectionKicker>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            See the Review Platform in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Track reviews, manage requests, and monitor your reputation — all from one dashboard.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-xl border border-border/40 bg-card p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{current.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{current.description}</p>
            <ul className="mt-6 space-y-3">
              {current.highlights.map((h) => {
                const Icon = h.icon
                return (
                  <li key={h.text} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {h.text}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-lg" />
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 shadow-2xl shadow-primary/5">
              <div className="mb-4 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-destructive/60" />
                <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-[10px] text-muted-foreground">{current.title}</span>
              </div>
              {current.mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
