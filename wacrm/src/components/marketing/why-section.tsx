import { CheckCircle, Shield, Zap, BarChart3, Users, Sparkles, MessagesSquare } from "lucide-react"
import { SectionBadge } from "./section-badge"

const reasons = [
  { icon: MessagesSquare, text: "Official WhatsApp Business API — not unofficial hacks" },
  { icon: Shield, text: "Self-hosted on your Supabase — full data ownership" },
  { icon: Users, text: "Multi-agent shared inbox with role-based access" },
  { icon: Zap, text: "No-code automations and visual flow builder" },
  { icon: BarChart3, text: "Public REST API for custom integrations" },
  { icon: Shield, text: "AES-256-GCM encrypted tokens — enterprise-grade security" },
]

export function WhySection() {
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: feature list */}
          <div>
            <SectionBadge><Sparkles className="h-3 w-3" /> Why Vbuild</SectionBadge>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Why choose Vbuild CRM?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to scale your WhatsApp sales, backed by enterprise-grade security and true data ownership.
            </p>
            <ul className="mt-8 space-y-4">
              {reasons.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.text} className="group flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-all duration-300 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">{item.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Right: benefit card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-2xl blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl">
              <div className="border-b border-border/30 bg-card-2/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Enterprise Security</p>
                    <p className="text-sm text-muted-foreground">SOC2-level data protection, built-in</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { icon: Shield, text: "AES-256-GCM encrypted tokens at rest and in transit" },
                  { icon: Shield, text: "Row-Level Security on every Supabase table" },
                  { icon: BarChart3, text: "HMAC-verified webhook signatures for integrity" },
                  { icon: Users, text: "Role-based access control with granular permissions" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.text} className="flex items-center gap-3 rounded-xl border border-border/30 bg-card-2/50 p-3.5 transition-colors hover:border-primary/20">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-border/30 bg-card-2/30 px-6 py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    SOC 2 compliant
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    GDPR ready
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    99.9% uptime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
