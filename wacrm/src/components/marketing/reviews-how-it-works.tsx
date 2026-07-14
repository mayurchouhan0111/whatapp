"use client"

import { QrCode, Star, MessageSquare, ArrowRight } from "lucide-react"
import { SectionKicker } from "./section-kicker"

const steps = [
  {
    icon: QrCode,
    title: "Print the QR Poster",
    description: "Generate a print-ready QR poster that links to your Google Review page. Download and display it at your store counter.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    step: "01",
  },
  {
    icon: Star,
    title: "Customers Leave a Review",
    description: "Customers scan the QR code with their phone camera and land directly on your Google Review page. They tap to rate and review in seconds.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    step: "02",
  },
  {
    icon: MessageSquare,
    title: "Get Notified on WhatsApp",
    description: "Every new review triggers an instant WhatsApp notification. You see the rating, review text, and customer name without opening Google.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    step: "03",
  },
]

export function ReviewsHowItWorks() {
  return (
    <section className="border-b border-border/40 bg-card/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>How It Works</SectionKicker>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Three Simple Steps to More Reviews
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No app download, no account for your customers. Just a QR code and their phone camera.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="group relative">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-12 hidden md:block">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
                <div className="relative rounded-2xl border border-border/30 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-sm`}>
                    <Icon className={`h-7 w-7 ${step.iconColor}`} />
                  </div>
                  <span className="text-4xl font-black text-muted-foreground/10 absolute top-4 right-4 select-none">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
