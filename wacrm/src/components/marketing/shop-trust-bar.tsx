import { Star, TrendingUp, ShoppingBag } from "lucide-react"

const stats = [
  { icon: ShoppingBag, label: "Active Stores", value: "2,400+" },
  { icon: TrendingUp, label: "Orders Processed", value: "85K+" },
  { icon: Star, label: "Avg. Rating", value: "4.8/5" },
]

export function ShopTrustBar() {
  return (
    <section className="border-y border-border/50 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by Store Owners Across India
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {["ShopIndia", "QuickServe", "GrowthX", "EduPrime", "GreenMart", "CraftBazaar"].map((name) => (
              <span key={name} className="text-sm font-semibold text-muted-foreground/50 transition-colors hover:text-muted-foreground/70">
                {name}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">{s.value}</span>
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
