import { MessageSquare, Target, Radio, Zap, Users, Workflow, ShoppingBag, TrendingUp, Clock, BarChart3, Shield, Bell } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const features = [
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Track every conversation in one clean dashboard — messages, response times, and team activity at a glance.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    chart: (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Total conversations</span>
          <span className="text-xs font-semibold text-foreground">23.02K</span>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Chats", pct: 55, color: "bg-violet-500" },
            { label: "Broadcast", pct: 28, color: "bg-amber-500" },
            { label: "Auto-reply", pct: 17, color: "bg-emerald-500" },
          ].map((item) => (
            <div key={item.label} className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-border">
                <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">{item.label} {item.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    title: "Pipeline Tracking",
    description: "Move deals effortlessly through stages with an intuitive system designed for clarity and control.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { stage: "New", count: "18", color: "text-blue-500" },
          { stage: "Qualified", count: "7", color: "text-violet-500" },
          { stage: "Closed", count: "23", color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.stage} className="rounded-lg border border-border/30 bg-card-2/50 p-2 text-center">
            <p className={`text-sm font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[9px] text-muted-foreground">{s.stage}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Radio,
    title: "Broadcast Studio",
    description: "Send targeted campaigns with delivery tracking and real-time engagement metrics.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    chart: (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Delivery rate</span>
          <span className="font-medium text-emerald-500">95%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div className="h-1.5 w-[95%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Sent: 2,450</span>
          <span>Opened: 1,836</span>
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Smart Automations",
    description: "Let smart reminders handle repetitive tasks so you can focus on closing deals.",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    chart: (
      <div className="space-y-1.5">
        {[
          { label: "Follow-ups", value: "12", status: "auto" },
          { label: "Triggers active", value: "8", status: "active" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/30 bg-card-2/50 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <Bell className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-[10px] font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ShoppingBag,
    title: "WhatsApp Storefront",
    description: "Launch a mobile storefront connected to your WhatsApp. Customers browse, cart, and order instantly.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "/shop",
    chart: (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Sales today</span>
          <span className="font-semibold text-foreground">₹12,400</span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 28 }}>
          {[40, 55, 35, 70, 50, 85, 65].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/60" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    description: "Get accurate reports and insights that help you understand growth patterns and make confident decisions.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
    chart: (
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Revenue", value: "₹48.2K", change: "+12%" },
          { label: "Response", value: "1.8m", change: "-15%" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border/30 bg-card-2/50 p-2 text-center">
            <p className="text-[9px] text-muted-foreground">{item.label}</p>
            <p className="text-xs font-bold text-foreground">{item.value}</p>
            <p className="text-[9px] text-emerald-500">{item.change}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Workflow,
    title: "Visual Flow Builder",
    description: "Design customer journeys without code. Drag, connect, and launch multi-step campaigns visually.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    chart: (
      <div className="flex items-center gap-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-500">S</div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-[9px] font-bold text-amber-500">Q</div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-500">C</div>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Contact Management",
    description: "Rich profiles with custom fields, tags, CSV import, and complete conversation history.",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
    chart: (
      <div className="flex -space-x-2 justify-center">
        {["PK", "RM", "AG", "SN", "VP"].map((initials, i) => (
          <div
            key={initials}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-[8px] font-bold"
            style={{
              background: `linear-gradient(135deg, oklch(0.526 0.247 293 / ${0.5 + i * 0.1}), oklch(0.526 0.247 293 / ${0.2 + i * 0.05}))`,
              color: "white",
            }}
          >
            {initials}
          </div>
        ))}
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-[8px] font-bold text-primary">+2K</div>
      </div>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><BarChart3 className="h-3 w-3" /> Features</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Powerful Features, Simple to Use
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to manage WhatsApp sales, track growth, and stay focused — without the clutter.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bento-card group p-5 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {feature.href && (
                    <span className="text-[10px] text-primary font-medium">Store &rarr;</span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-foreground">
                  {feature.href ? (
                    <Link href={feature.href} className="hover:text-primary transition-colors">
                      {feature.title}
                    </Link>
                  ) : (
                    feature.title
                  )}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>

                {feature.chart && (
                  <div className="mt-3 rounded-xl border border-border/20 bg-card-2/30 p-3">
                    {feature.chart}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
