import { Star, Quote } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const testimonials = [
  {
    name: "Rajesh Mehta",
    handle: "@rajeshmehta",
    role: "Founder, ShopIndia",
    content: "Getting Google reviews used to be a struggle. Now we just display the QR poster at our counter. Customers scan while waiting, and we get notified instantly. Our review count doubled in the first month.",
    rating: 5,
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    name: "Kavita Jain",
    handle: "@kavitajain",
    role: "Owner, GreenMart Organics",
    content: "The WhatsApp notification is brilliant. I know the exact moment a customer leaves a review. The request feature lets us follow up after delivery — our Google rating went from 4.2 to 4.7.",
    rating: 5,
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    name: "Arun Pillai",
    handle: "@arunpillai",
    role: "CEO, CraftBazaar",
    content: "We send review requests to every customer after purchase via WhatsApp. The one-tap link makes it effortless. Our response rate is over 65% — way better than email campaigns.",
    rating: 5,
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    name: "Sneha Reddy",
    handle: "@snehareddy",
    role: "Owner, Bliss Beauty",
    content: "The print-ready QR poster is so convenient. We laminated it and put it at our reception desk. Every customer scans it while waiting. The dashboard shows exactly how many reviews came in each day.",
    rating: 5,
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
  },
  {
    name: "Vikram Singh",
    handle: "@vikramsingh",
    role: "Founder, DesiDukaan",
    content: "Our Google Business Profile was stuck at 30 reviews for months. With automated requests and the QR poster, we crossed 200 reviews in 6 weeks. The analytics help us track what's working.",
    rating: 5,
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    name: "Priya Sharma",
    handle: "@priyasharma",
    role: "Owner, Urban Garden",
    content: "Setup took 5 minutes. Connected my Google Business Profile, designed the QR poster, and printed it. That same day a customer scanned and left a 5-star review. Absolutely love how simple it is.",
    rating: 5,
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
]

export function ReviewsTestimonials() {
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><Quote className="h-3 w-3" /> Testimonials</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Real Businesses, Real Results
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how businesses are collecting more Google Reviews with Vbuild CRM.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
            ))}
          </div>
          <span className="text-lg font-semibold text-foreground">4.8</span>
          <span className="text-sm text-muted-foreground">Stars out of 5</span>
        </div>

        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee gap-6">
              {testimonials.map((t, ti) => (
                <div key={`${t.handle}-${ti}`} className="w-80 shrink-0 rounded-2xl border border-border/50 bg-card p-6">
                  <div className="mb-1 flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, ri) => (
                      <Star key={ri} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border/40 pt-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold ${t.iconColor}`}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.handle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex animate-marquee gap-6" aria-hidden="true">
              {testimonials.map((t, ti) => (
                <div key={`${t.handle}-${ti}-dup`} className="w-80 shrink-0 rounded-2xl border border-border/50 bg-card p-6">
                  <div className="mb-1 flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, ri) => (
                      <Star key={ri} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border/40 pt-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold ${t.iconColor}`}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.handle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all testimonials
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
