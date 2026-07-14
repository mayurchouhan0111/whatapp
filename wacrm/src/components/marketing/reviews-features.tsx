"use client"

import { QrCode, MessageSquare, BarChart3, Globe, Download, Bell, Users, Settings } from "lucide-react"
import { SectionBadge } from "./section-badge"

const features = [
  {
    icon: QrCode,
    title: "Custom QR Posters",
    description: "Generate branded QR code posters that link directly to your Google Review page. Download in print-ready format.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    icon: Bell,
    title: "WhatsApp Notifications",
    description: "Get instant WhatsApp alerts when a customer leaves a new review. See rating, review text, and reviewer name.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Reputation Dashboard",
    description: "Track reviews, ratings, and trends over time. See your average rating and review volume at a glance.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "Review Request via WhatsApp",
    description: "Send review requests directly to customers via WhatsApp. Include a one-tap link to your Google Review page.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    icon: Globe,
    title: "Google Review Integration",
    description: "Deep-link customers straight to your Google Business Profile review page. Works on all devices.",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    icon: Download,
    title: "Print-Ready Posters",
    description: "Download your QR poster in high-resolution PDF. Print and display at checkout, counter, or reception.",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
  },
  {
    icon: Users,
    title: "Team Access",
    description: "Grant team members view or manage access to your reputation dashboard. Control who sees review data.",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
  },
  {
    icon: Settings,
    title: "Review Request Rules",
    description: "Configure when review requests are sent — after order delivery, on customer birthday, or manually triggered.",
    gradient: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
  },
]

export function ReviewsFeatures() {
  return (
    <section className="border-b border-border/40 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><BarChart3 className="h-3 w-3" /> Features</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to Collect Reviews
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for Indian businesses — simple, effective, and works with your existing Google Business Profile.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group rounded-2xl border border-border/30 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-sm`}>
                  <Icon className={`h-6 w-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
