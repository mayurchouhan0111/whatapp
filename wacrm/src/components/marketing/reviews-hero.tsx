"use client"

import Link from "next/link"
import { ArrowRight, Star, MessageSquare, QrCode, CheckCircle } from "lucide-react"
import { useState } from "react"

const AVATARS = [
  { initials: "RM", color: "from-violet-500 to-violet-600" },
  { initials: "KJ", color: "from-emerald-500 to-emerald-600" },
  { initials: "AP", color: "from-amber-500 to-amber-600" },
  { initials: "SR", color: "from-rose-500 to-rose-600" },
  { initials: "VS", color: "from-blue-500 to-blue-600" },
]

export function ReviewsHero() {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute top-0 -left-40 h-[500px] w-[500px] animate-float rounded-full bg-gradient-to-br from-amber-500/20 via-primary/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 -right-40 h-[500px] w-[500px] animate-float-slow rounded-full bg-gradient-to-br from-emerald-500/15 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/5">
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Google Review Feedback — Powered by Vbuild CRM
          </div>

          <h1 className="mt-6 animate-slide-up text-balance text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
            Collect Google Reviews
            <br className="hidden sm:block" />
            <span className="inline-block bg-[#0fe875] border-2 border-gray-900 px-3 py-1 mt-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] -rotate-1 text-gray-900">
              Automatically
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-balance text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:100ms]">
            Print a QR poster, display it at your store, and customers leave a Google review in seconds. You get notified on WhatsApp when new reviews come in.
          </p>

          <div className="mt-8 flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:200ms]">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0fe875] border-2 border-gray-900 px-8 text-sm font-bold text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white shadow-[0_0_10px_rgba(16,185,129,0.2)] px-8 text-sm font-medium text-foreground transition-all hover:bg-emerald-100 hover:-translate-y-0.5"
            >
              See Plans
            </Link>
          </div>

          <div className="mt-8 flex animate-fade-in flex-col items-center gap-4 sm:flex-row sm:justify-center [animation-delay:300ms]">
            <div className="flex -space-x-3">
              {AVATARS.map((avatar) => (
                <div
                  key={avatar.initials}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br ${avatar.color} text-[10px] font-bold text-white shadow-sm`}
                >
                  {avatar.initials}
                </div>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[10px] font-bold text-primary shadow-sm">
                +2.4K
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,400+</span> businesses use Vbuild for reviews
            </div>
          </div>
        </div>

        {/* Interactive review mockup */}
        <div className="mx-auto mt-16 max-w-3xl animate-slide-up [animation-delay:400ms]">
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-amber-500/25 via-primary/10 to-emerald-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 border-b border-border/40 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <div className="ml-3 flex-1 text-center text-xs font-medium text-muted-foreground/70">reviews.vbuildcrm.com/your-business</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* QR Code poster preview */}
                  <div className="rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-xl bg-white shadow-lg border border-gray-200">
                      <QrCode className="h-20 w-20 text-gray-900" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Scan to Review</p>
                    <p className="text-xs text-muted-foreground">Print-ready QR poster</p>
                  </div>

                  {/* Live review notification */}
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border/40 bg-card-2 p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                        <span>WhatsApp notification</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">New 5★ review from Priya!</p>
                      <p className="text-xs text-muted-foreground">&ldquo;Amazing service, highly recommend!&rdquo;</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card-2 p-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (hoveredStar ?? 5)
                                ? "fill-amber-500 text-amber-500"
                                : "text-gray-300"
                            }`}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-foreground">4.8 avg rating</span>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 p-2.5 text-center">
                      <p className="text-xs font-medium text-emerald-600">+12 reviews this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex animate-fade-in flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground [animation-delay:500ms]">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            Print-ready QR posters
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            WhatsApp alerts
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            Google Review links
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            Free CRM included
          </div>
        </div>
      </div>
    </section>
  )
}
