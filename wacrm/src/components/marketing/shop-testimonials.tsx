import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Mehta",
    role: "Founder, ShopIndia — Handicrafts",
    content: "We were managing orders manually on WhatsApp — it was chaos. Vbuild Storefront changed everything. Customers browse our full catalog, order in 15 seconds, and we track everything from one dashboard. Our monthly orders tripled.",
    rating: 5,
    initials: "RM",
    gradient: "from-violet-500/20 to-violet-500/5",
  },
  {
    name: "Kavita Jain",
    role: "Owner, GreenMart Organics",
    content: "The branded store link is a game changer. We share it on Instagram and WhatsApp groups — customers order directly without leaving the chat. UPI payments + auto-confirmation means zero manual follow-up.",
    rating: 5,
    initials: "KJ",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    name: "Arun Pillai",
    role: "CEO, CraftBazaar",
    content: "We have 600+ products across 12 categories. CSV import took 5 minutes. The analytics show us exactly which products sell best by region. It's like having an e-commerce platform built into our WhatsApp CRM.",
    rating: 5,
    initials: "AP",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  {
    name: "Sneha Reddy",
    role: "Owner, Bliss Beauty",
    content: "My customers love how easy it is to order. They just tap, add to cart, and — bam — the order comes to my WhatsApp. No app install, no account creation. The delivery status updates are automated too.",
    rating: 5,
    initials: "SR",
    gradient: "from-rose-500/20 to-rose-500/5",
  },
  {
    name: "Vikram Singh",
    role: "Founder, DesiDukaan",
    content: "The free delivery above ₹300 logic is brilliant. It increased our average order value by 40%. Customers add more items to qualify. The dashboard gives us real-time revenue and order tracking.",
    rating: 5,
    initials: "VS",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    name: "Priya Sharma",
    role: "Owner, Urban Garden",
    content: "From zero to live store in 15 minutes. I uploaded my plant catalog, set my WhatsApp number, and shared the link on Instagram. Orders started coming in within the hour. Absolutely love it.",
    rating: 5,
    initials: "PS",
    gradient: "from-primary/20 to-primary/5",
  },
]

export function ShopTestimonials() {
  return (
    <section className="border-b border-border/50 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Quote className="h-3 w-3" />
            Store Owner Stories
          </div>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Real Stores, Real Results
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how businesses are turning WhatsApp chats into sales.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
