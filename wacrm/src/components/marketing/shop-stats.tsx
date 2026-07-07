import { ShoppingBag, TrendingUp, Star, Store, Globe, Clock } from "lucide-react"

const stats = [
  { icon: Store, value: "2,400+", label: "Active Stores" },
  { icon: ShoppingBag, value: "85K+", label: "Orders Processed" },
  { icon: TrendingUp, value: "₹3.2Cr+", label: "Revenue Generated" },
  { icon: Star, value: "4.8/5", label: "Store Owner Rating" },
]

export function ShopStats() {
  return (
    <section className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Trusted by Thousands of Store Owners
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Businesses across India use Vbuild CRM to power their WhatsApp stores.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="group relative rounded-2xl border border-border/60 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
