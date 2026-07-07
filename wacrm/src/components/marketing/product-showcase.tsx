import { MessageSquare, GitBranch, Radio, Workflow, ArrowRight, BarChart3, Users, Zap } from "lucide-react"

const showcases = [
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    subtitle: "Every conversation, one place",
    description: "Multiple agents share one WhatsApp number. Assign conversations, add private notes, and track response times — all without leaving the dashboard.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/20",
    metric: "3 agents, 1 number",
    features: ["Real-time assignment", "Internal notes", "Response time tracking", "Unread filters"],
  },
  {
    icon: GitBranch,
    title: "Pipeline Board",
    subtitle: "Deals that move, revenue that grows",
    description: "Visual Kanban pipeline connected to WhatsApp. Drag deals across stages, track pipeline value, and message customers without leaving the board.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    metric: "42% higher close rate",
    features: ["Custom stages", "Drag & drop", "Deal WhatsApp chat", "Pipeline analytics"],
  },
  {
    icon: Radio,
    title: "Broadcast Studio",
    subtitle: "Send campaigns that convert",
    description: "Compose, target, and send Meta-approved template messages with tracking. Schedule broadcasts, personalize with variables, and monitor delivery in real time.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    metric: "95% delivery rate",
    features: ["Template messages", "Audience segmentation", "Delivery tracking", "Read receipts"],
  },
  {
    icon: Workflow,
    title: "Automation Engine",
    subtitle: "Your CRM, working 24/7",
    description: "Trigger actions on keywords, schedules, or inbound messages. Multi-step flows with conditions, webhooks, tags, and WhatsApp actions — no code required.",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    borderColor: "border-rose-500/20",
    metric: "60h saved/month",
    features: ["Trigger-based flows", "Conditional branching", "Webhook actions", "Scheduled runs"],
  },
]

export function ProductShowcase() {
  return (
    <section className="border-b border-border/50 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <BarChart3 className="h-3 w-3" />
            Product
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            See the CRM in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every feature designed to help you sell faster on WhatsApp.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {showcases.map((item, i) => {
            const Icon = item.icon
            const isReversed = i % 2 === 1

            return (
            <div
              key={item.title}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12`}
            >
                {/* Mockup */}
                <div className={`${isReversed ? "lg:order-2" : ""}`}>
                  <div className="relative">
                    <div className={`absolute -inset-3 rounded-2xl bg-gradient-to-br ${item.color} blur-md`} />
                    <div className={`relative overflow-hidden rounded-xl border ${item.borderColor} bg-card shadow-lg`}>
                      <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-destructive/70" />
                        <div className="h-2 w-2 rounded-full bg-amber-500/70" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
                        <span className="ml-3 text-[10px] text-muted-foreground font-medium">{item.title}</span>
                      </div>
                      <div className="p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} ${item.iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                              {item.metric}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {item.features.map((f) => (
                            <div key={f} className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card-2 p-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-[11px] text-muted-foreground">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className={isReversed ? "lg:order-1" : ""}>
                  <div className={`mb-3 inline-flex items-center gap-2 rounded-full border ${item.borderColor} bg-primary/5 px-3 py-1 text-xs font-medium ${item.iconColor}`}>
                    <Icon className="h-3 w-3" />
                    {item.title}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{item.subtitle}</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">{item.description}</p>
                  <div className="mt-6 flex items-center gap-3 text-sm">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br ${item.color} text-[9px] font-bold ${item.iconColor}`}>
                          {String.fromCharCode(64 + n)}
                        </div>
                      ))}
                    </div>
                    <span className="text-muted-foreground">Trusted by 500+ businesses</span>
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
