import { Star, Quote } from "lucide-react"
import Link from "next/link"
import { SectionKicker } from "./section-kicker"

const testimonials = [
  {
    name: "Emily Watson",
    role: "Founder, ShopIndia",
    content: "Finally, a dashboard that shows everything that matters — users, orders, and revenue all in one clean view. It helps us make informed decisions much faster.",
    rating: 5,
  },
  {
    name: "Alex Rivera",
    role: "Operations Head, QuickServe",
    content: "The interface is incredibly intuitive and the tools are very practical. We've cut our deal cycle time almost in half since making the switch.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "CEO, GrowthX",
    content: "From onboarding to daily usage, everything feels well thought out. The components are polished, consistent, and production-ready.",
    rating: 5,
  },
  {
    name: "Sarah Chen",
    role: "Marketing Lead, EduPrime",
    content: "Clean design and sensible defaults make a huge difference. The documentation is clear and easy to follow, which saved me hours during setup.",
    rating: 5,
  },
  {
    name: "Ncdai",
    role: "CTO, Mediconnect",
    content: "I've used many CRM platforms, but this one strikes the perfect balance. The customization options are incredibly flexible without sacrificing design quality.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Sales Director, TechCorp",
    content: "The seamless integrations streamlined my daily workflow significantly. I can manage emails, track clients, and schedule follow-ups without ever leaving the platform.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Testimonials</SectionKicker>
          <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by People Who Sell Smarter
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Real stories from businesses that simplified their WhatsApp sales and grew their revenue with Vbuild CRM.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-900">4.9</span>
          <span className="text-sm text-gray-400">Stars out of 5</span>
        </div>

        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

          <div className="flex overflow-hidden">
            <div className="flex animate-marquee gap-6">
              {testimonials.map((t, ti) => (
                <div
                  key={`${t.name}-${ti}`}
                  className="w-80 shrink-0 rounded-xl border border-gray-200 bg-white p-6"
                >
                  <div className="mb-1 flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, ri) => (
                      <Star key={ri} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex animate-marquee gap-6" aria-hidden="true">
              {testimonials.map((t, ti) => (
                <div
                  key={`${t.name}-${ti}-dup`}
                  className="w-80 shrink-0 rounded-xl border border-gray-200 bg-white p-6"
                >
                  <div className="mb-1 flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, ri) => (
                      <Star key={ri} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
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
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            View all testimonials
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}