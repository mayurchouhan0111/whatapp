import { ShoppingBag, Package, BarChart3, MessageSquare, Globe, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: ShoppingBag,
    title: "Product Catalog",
    description: "Add products with images, prices, categories, and stock tracking. Import bulk via CSV in one click.",
    metric: "Import 1000+ products",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    icon: Globe,
    title: "Branded Storefront",
    description: "Every store gets a unique URL at /shop/your-brand. Customize colors, logo, and banner.",
    metric: "Unique branded link",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Ordering",
    description: "One tap sends a pre-formatted order summary to your WhatsApp. Customer just hits send.",
    metric: "Orders in under 15s",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: Package,
    title: "Order Dashboard",
    description: "Track all orders in one place. Update statuses, manage inventory, and chat with customers.",
    metric: "Full order lifecycle",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Track revenue, top products, order trends, and customer insights. Export reports anytime.",
    metric: "Real-time insights",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
  },
  {
    icon: Zap,
    title: "Auto-pilot Workflows",
    description: "Automate order confirmations, delivery updates, and follow-ups — all via WhatsApp templates.",
    metric: "70% less manual work",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
]

export function ShopFeatures() {
  return (
    <section className="border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to Sell on WhatsApp
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From product catalog to delivery — manage your entire store from one dashboard.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} ${f.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span>{f.metric}</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
