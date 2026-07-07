import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Mehta",
    role: "Founder, ShopIndia",
    content: "We moved all our customer support and sales to Vbuild CRM. Response time dropped from 4 hours to 8 minutes. Our WhatsApp sales doubled in the first month.",
    rating: 5,
    initials: "RM",
    gradient: "from-violet-500/20 to-violet-500/5",
  },
  {
    name: "Neha Kapoor",
    role: "Operations Head, QuickServe",
    content: "The shared inbox alone saved us from chaos. Five agents, one WhatsApp number, zero confusion. The automation engine handles 60% of our replies now.",
    rating: 5,
    initials: "NK",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    name: "Arun Pillai",
    role: "CEO, GrowthX",
    content: "We evaluated HubSpot, Pipedrive, and Zoho. Vbuild won because it's built specifically for WhatsApp. The pipeline + WhatsApp integration is a game changer.",
    rating: 5,
    initials: "AP",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  {
    name: "Sneha Reddy",
    role: "Marketing Lead, EduPrime",
    content: "Broadcast campaigns that used to take us 2 days now take 10 minutes. The template message builder with variables is incredibly powerful yet simple.",
    rating: 5,
    initials: "SR",
    gradient: "from-rose-500/20 to-rose-500/5",
  },
]

export function TestimonialsSection() {
  return (
    <section className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Quote className="h-3 w-3" />
            Testimonials
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Loved by Businesses Across India
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See why companies are switching to Vbuild CRM for their WhatsApp sales.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              <div className="relative">
                <div className="mb-1 flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-foreground`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
