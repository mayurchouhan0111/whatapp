import Link from "next/link"
import { ArrowRight, Play, MessageSquare, Users, GitBranch, BarChart3, CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text */}
          <div>
            <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/5">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
              #1 WhatsApp CRM for Business
            </div>

            <h1 className="mt-6 animate-slide-up text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn WhatsApp Chats Into
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"> Closed Deals</span>
            </h1>

            <p className="mt-5 animate-slide-up text-balance text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:100ms]">
              The all-in-one CRM built on the official WhatsApp Business API. Shared inbox, pipeline tracking, broadcasts, automations, and a storefront — manage your entire sales workflow from one dashboard.
            </p>

            <div className="mt-8 flex animate-slide-up flex-col gap-3 sm:flex-row sm:items-center [animation-delay:200ms]">
              <Link
                href="/signup"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:-translate-y-0.5"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Demo
              </Link>
            </div>

            <div className="mt-6 flex animate-fade-in flex-wrap items-center gap-5 text-xs text-muted-foreground [animation-delay:300ms]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                Free tier included
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                14-day trial
              </div>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="animate-slide-up [animation-delay:300ms]">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <div className="ml-3 flex-1 text-center text-xs font-medium text-muted-foreground">dashboard.vbuildcrm.com</div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">Inbox</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-medium">3 unread</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Priya Sharma", msg: "Hi! I'm interested in your premium plan...", time: "2m ago", active: true },
                      { name: "Rahul Verma", msg: "Can you share the product catalog?", time: "15m ago", active: false },
                      { name: "Ananya Gupta", msg: "When will my order be delivered?", time: "1h ago", active: false },
                      { name: "Vikram Singh", msg: "Thanks for the quick support!", time: "2h ago", active: false },
                    ].map((chat) => (
                      <div
                        key={chat.name}
                        className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                          chat.active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-bold text-primary">
                          {chat.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{chat.name}</span>
                            <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                          </div>
                          <p className="truncate text-[11px] text-muted-foreground">{chat.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                    <div className="flex h-8 flex-1 items-center rounded-lg border border-border/60 bg-background px-3 text-[11px] text-muted-foreground">
                      Type a message...
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border/60 bg-card-2 p-2.5 text-center">
                      <Users className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-0.5 text-[10px] font-medium text-foreground">3 agents</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card-2 p-2.5 text-center">
                      <GitBranch className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-0.5 text-[10px] font-medium text-foreground">2 pipelines</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card-2 p-2.5 text-center">
                      <BarChart3 className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-0.5 text-[10px] font-medium text-foreground">12 deals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
