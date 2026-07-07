import Link from "next/link"
import { ArrowRight, Store, ShoppingBag, BarChart3, Users, CheckCircle, Star } from "lucide-react"

export function ShopHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/5">
              <Store className="h-3.5 w-3.5" />
              WhatsApp Storefront
            </div>

            <h1 className="mt-6 animate-slide-up text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Turn Your WhatsApp Into a
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"> Selling Machine</span>
            </h1>

            <p className="mt-5 animate-slide-up text-balance text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:100ms]">
              Launch a mobile-optimized storefront connected to your WhatsApp in minutes. Customers browse, cart, and checkout — you get orders instantly in your CRM dashboard.
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
                href="/pricing"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:-translate-y-0.5"
              >
                See Plans
              </Link>
            </div>

            <div className="mt-6 flex animate-fade-in flex-wrap items-center gap-5 text-xs text-muted-foreground [animation-delay:300ms]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                Setup in minutes
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                UPI & COD included
              </div>
            </div>
          </div>

          <div className="animate-slide-up [animation-delay:300ms]">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <div className="ml-3 flex-1 text-center text-xs font-medium text-muted-foreground">store.vbuildcrm.com</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ShoppingBag className="h-3 w-3" />
                    12 items
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Store className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground">Your Store</span>
                        <p className="text-[10px] text-muted-foreground">vbuildcrm.com/shop/your-brand</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-emerald-500">Live</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Handloom Saree", price: "₹899", orders: "24 sold", gradient: "from-violet-500/20 to-violet-500/5" },
                      { name: "Organic Honey", price: "₹349", orders: "18 sold", gradient: "from-amber-500/20 to-amber-500/5" },
                      { name: "Bamboo Planter", price: "₹499", orders: "12 sold", gradient: "from-emerald-500/20 to-emerald-500/5" },
                    ].map((item) => (
                      <div key={item.name} className={`rounded-xl bg-gradient-to-br ${item.gradient} p-3 text-center transition-all hover:-translate-y-0.5`}>
                        <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-lg bg-card/60 text-xs font-bold text-foreground">
                          {item.name.split(" ").map(w => w[0]).join("")}
                        </div>
                        <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs font-bold text-primary">{item.price}</p>
                        <p className="text-[9px] text-muted-foreground">{item.orders}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                    <div className="flex h-8 flex-1 items-center rounded-lg border border-border/60 bg-background px-3 text-[11px] text-muted-foreground">
                      Search products...
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-border/60 p-2.5 text-center">
                      <ShoppingBag className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-0.5 text-[10px] font-medium text-foreground">24 products</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-2.5 text-center">
                      <BarChart3 className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-0.5 text-[10px] font-medium text-foreground">₹1.2L sales</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-2.5 text-center">
                      <Users className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-0.5 text-[10px] font-medium text-foreground">86 customers</p>
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
