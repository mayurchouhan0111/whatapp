import { BarChart3, Bell, Target, TrendingUp, ArrowRight, Zap, Users, MessageSquare } from "lucide-react"
import { SectionKicker } from "./section-kicker"

const BENEFITS = [
  {
    icon: BarChart3,
    title: "Unified Sales Overview",
    description: "Monitor leads, purchases, and orders in real-time to stay updated on every key business metric. This ensures you have the latest insights to make informed decisions.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    mockup: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Today's Overview</span>
          <span className="text-[10px] text-emerald-500">+12% vs yesterday</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Leads", value: "24", change: "+8%", color: "text-primary" },
            { label: "Deals", value: "12", change: "+15%", color: "text-emerald-500" },
            { label: "Revenue", value: "₹48K", change: "+22%", color: "text-amber-500" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/30 bg-card-2/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-emerald-500">{item.change}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Automated Follow-Ups",
    description: "Let smart reminders handle repetitive tasks, allowing you to concentrate on closing more deals rather than managing them. This way, you can maximise your productivity and achieve better results.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    mockup: (
      <div className="space-y-2">
        {[
          { name: "Follow up with Priya", time: "2:00 PM", status: "Scheduled" },
          { name: "Send catalog to Rahul", time: "3:30 PM", status: "Pending" },
          { name: "Quote for Ananya", time: "Tomorrow", status: "Draft" },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-xl border border-border/30 bg-card-2/50 p-3">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{item.time}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Target,
    title: "Clean & Simple Workflow",
    description: "Move deals effortlessly through stages with our intuitive pipeline system designed for clarity and control. This system ensures that you always have a clear view of your progress.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    mockup: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { stage: "New", count: "8", value: "₹12.4K" },
          { stage: "Qualified", count: "5", value: "₹18.7K" },
          { stage: "Closed", count: "3", value: "₹24.1K" },
        ].map((s) => (
          <div key={s.stage} className="rounded-xl border border-border/30 bg-card-2/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{s.stage}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Instant Performance Insights",
    description: "Get accurate reports and analytics that help you understand growth patterns and make confident decisions. These insights empower you to strategise effectively for future success.",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    mockup: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Weekly trend</span>
          <span className="text-[10px] font-medium text-emerald-500">+18% growth</span>
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/60 transition-all" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    ),
  },
]

export function BenefitsSection() {
  return (
    <section className="border-b border-border/40 bg-card/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Benefits</SectionKicker>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            How Vbuild Helps You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            It&apos;s built to simplify your WhatsApp sales process and keep everything easy to manage.
          </p>
        </div>

        <div className="mt-16 space-y-20">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon
            const isReversed = i % 2 === 1
            return (
              <div
                key={benefit.title}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${isReversed ? "lg:text-right" : ""}`}
              >
                <div className={isReversed ? "lg:order-2" : ""}>
                  <div className={`mb-3 inline-flex items-center gap-2 rounded-full border border-border/30 bg-primary/5 px-3 py-1 text-xs font-medium ${benefit.iconColor}`}>
                    <Icon className="h-3 w-3" />
                    {benefit.title}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{benefit.title}</h3>
                  <p className={`mt-4 text-base leading-relaxed text-muted-foreground`}>{benefit.description}</p>
                  <div className={`mt-6 flex items-center gap-1 text-sm font-medium text-primary ${isReversed ? "lg:justify-end" : ""}`}>
                    <span>Learn more</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                <div className={isReversed ? "lg:order-1" : ""}>
                  <div className="relative">
                    <div className={`absolute -inset-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} blur-xl`} />
                    <div className="relative rounded-xl border border-border/40 bg-card p-5 shadow-xl">
                      <div className="mb-3 flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-destructive/60" />
                        <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
                        <span className="ml-2 text-[10px] text-muted-foreground">{benefit.title}</span>
                      </div>
                      {benefit.mockup}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
