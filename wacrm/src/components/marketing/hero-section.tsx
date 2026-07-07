import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/5">
            <Zap className="h-3.5 w-3.5 fill-primary/20" />
            WhatsApp CRM, Built for Growth
          </div>

          <h1 className="animate-slide-up text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Turn WhatsApp Conversations
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Into Revenue
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-balance text-lg text-muted-foreground sm:text-xl [animation-delay:100ms]">
            Shared inbox, contact management, sales pipelines, broadcasts, automations, and WhatsApp Storefront —
            all connected to your WhatsApp Business API.
          </p>

          <div className="mt-10 flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:200ms]">
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-6 animate-fade-in text-xs text-muted-foreground [animation-delay:300ms]">
            No credit card required. Free tier included.
          </p>
        </div>
      </div>
    </section>
  )
}
