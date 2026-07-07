import { MessageSquare, Users, GitBranch, Radio, Zap, Workflow } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Shared Inbox",
    description: "Multiple agents, one number. Assign conversations, leave notes, track status — all in real time.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    borderColor: "hover:border-violet-500/30",
    shadowColor: "hover:shadow-violet-500/5",
  },
  {
    icon: Users,
    title: "Contacts & Tags",
    description: "Rich contact profiles with custom fields, tags, CSV import, and automatic deduplication.",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    borderColor: "hover:border-blue-500/30",
    shadowColor: "hover:shadow-blue-500/5",
  },
  {
    icon: GitBranch,
    title: "Sales Pipelines",
    description: "Kanban deal tracking connected to WhatsApp conversations. Drag, drop, close.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "hover:border-emerald-500/30",
    shadowColor: "hover:shadow-emerald-500/5",
  },
  {
    icon: Radio,
    title: "Broadcasts",
    description: "Send Meta-approved template messages with delivery tracking, read receipts, and variables.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    borderColor: "hover:border-amber-500/30",
    shadowColor: "hover:shadow-amber-500/5",
  },
  {
    icon: Zap,
    title: "Automations",
    description: "Trigger actions on inbound messages, keywords, or schedules. Conditional branches, webhooks, tags.",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    borderColor: "hover:border-rose-500/30",
    shadowColor: "hover:shadow-rose-500/5",
  },
  {
    icon: Workflow,
    title: "Visual Flows",
    description: "No-code flow builder — design customer journeys with drag-and-drop nodes.",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
    borderColor: "hover:border-cyan-500/30",
    shadowColor: "hover:shadow-cyan-500/5",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Features
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to Sell on WhatsApp
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From shared inbox to automations — a complete CRM built on the official WhatsApp Business API.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.borderColor} ${feature.shadowColor}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
