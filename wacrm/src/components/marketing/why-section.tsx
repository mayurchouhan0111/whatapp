import { CheckCircle, Shield, Phone, UsersRound, BarChart3, Sparkles } from "lucide-react"

const reasons = [
  "Official WhatsApp Business API — not unofficial hacks",
  "Self-hosted on your Supabase — full data ownership",
  "Multi-agent shared inbox with role-based access",
  "No-code automations and visual flow builder",
  "Public REST API for custom integrations",
  "AES-256-GCM encrypted tokens — enterprise-grade security",
]

const securityItems = [
  { icon: Shield, text: "AES-256-GCM encrypted tokens" },
  { icon: Shield, text: "Row-Level Security on every table" },
  { icon: BarChart3, text: "HMAC-verified webhook signatures" },
  { icon: Phone, text: "Rate limiting & CSP headers" },
]

export function WhySection() {
  return (
    <section className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Why Vbuild
            </div>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Why choose Vbuild CRM?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to scale your WhatsApp sales, backed by enterprise-grade security.
            </p>
            <ul className="mt-8 space-y-4">
              {reasons.map((item) => (
                <li key={item} className="group flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl">
              <div className="flex items-center gap-3 border-b border-border pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Enterprise Security</p>
                  <p className="text-sm text-muted-foreground">SOC2-level data protection</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {securityItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
