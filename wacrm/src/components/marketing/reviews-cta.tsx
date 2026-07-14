import Link from "next/link"
import { ArrowRight, Star, CheckCircle, MessageSquare } from "lucide-react"

export function ReviewsCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/25 via-primary/10 to-emerald-500/10 animate-gradient-shift" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl animate-orb-pulse" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-orb-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute top-10 right-10 hidden animate-float-slow lg:block">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 shadow-lg">
          <Star className="h-8 w-8 text-amber-500" />
        </div>
      </div>
      <div className="absolute bottom-10 left-10 hidden animate-float lg:block" style={{ animationDelay: "1s" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 shadow-lg">
          <MessageSquare className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-600 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse-soft" />
            Start Collecting Reviews Today
          </div>

          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Turn Every Customer Into a{" "}
            <span className="text-amber-600">
              5-Star Review
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Join 2,400+ businesses already collecting Google Reviews automatically with Vbuild CRM. Start with a free account — add Reviews when you&apos;re ready.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="btn-primary h-12"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="btn-ghost h-12"
            >
              Compare Plans
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              No credit card
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              14-day free trial
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              Free CRM included
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
