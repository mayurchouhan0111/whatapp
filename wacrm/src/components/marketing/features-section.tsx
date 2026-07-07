import {
  MessageSquare,
  Users,
  GitBranch,
  Radio,
  Zap,
  Workflow,
  ShoppingBag,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Shared Inbox",
    outcome: "Respond to customers 3x faster",
    description: "Multiple agents, one number. Assign conversations, add internal notes, track status — all in real time with zero context switching.",
    metric: "3x faster response",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    icon: Target,
    title: "Pipeline Deal Tracking",
    outcome: "Close more deals, faster",
    description: "Kanban boards connected to WhatsApp conversations. Drag deals through stages, track value, and never lose a lead again.",
    metric: "42% higher close rate",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: Radio,
    title: "Broadcast Campaigns",
    outcome: "Reach thousands in one click",
    description: "Send Meta-approved template messages with delivery tracking, read receipts, and dynamic variables. Target segments with precision.",
    metric: "95% delivery rate",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    icon: Zap,
    title: "Smart Automations",
    outcome: "Eliminate manual follow-ups",
    description: "Trigger actions on inbound messages, keywords, or schedules. Conditional branches, webhooks, auto-tags — let the CRM work while you sleep.",
    metric: "60h saved/month",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
  },
  {
    icon: Users,
    title: "Contact Management",
    outcome: "Know every customer intimately",
    description: "Rich profiles with custom fields, tags, CSV import, automatic deduplication, and complete conversation history at a glance.",
    metric: "10k+ contacts",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    icon: Workflow,
    title: "Visual Flow Builder",
    outcome: "Design journeys without code",
    description: "No-code flow builder — drag, connect, and launch. Design customer journeys, auto-replies, and multi-step campaigns visually.",
    metric: "Zero coding",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
  },
  {
    icon: ShoppingBag,
    title: "WhatsApp Storefront",
    outcome: "Sell directly on WhatsApp",
    description: "Launch a mobile storefront at /shop/your-brand. Customers browse, cart, and order — all through WhatsApp. UPI & COD supported.",
    metric: "Instant store setup",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    href: "/shop",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Reports",
    outcome: "Data-driven decisions",
    description: "Track response times, deal velocity, broadcast performance, and agent productivity. Real-time dashboards your whole team can use.",
    metric: "Real-time insights",
    gradient: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
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
            Everything a Modern Sales Team Needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From first message to closed deal — all inside WhatsApp. No switching apps, no lost context.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {feature.metric}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.href ? (
                      <Link href={feature.href} className="hover:text-primary transition-colors">
                        {feature.title} <span className="text-xs text-primary">&#8599;</span>
                      </Link>
                    ) : (
                      feature.title
                    )}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-primary">{feature.outcome}</p>
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
