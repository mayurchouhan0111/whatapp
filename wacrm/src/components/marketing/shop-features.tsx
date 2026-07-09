import { ShoppingBag, Globe, MessageSquare, Package, BarChart3, Zap, Bell, TrendingUp } from "lucide-react"
import Link from "next/link"
import { SectionBadge } from "./section-badge"

const features = [
  {
    icon: ShoppingBag,
    title: "Product Catalog",
    description: "Add products with images, prices, categories, and stock tracking. Import bulk via CSV in one click.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Products</span>
          <span className="text-xs font-semibold text-foreground">1,200+</span>
        </div>
        <div className="flex items-end gap-1" style={{ height: 28 }}>
          {[35, 50, 65, 45, 80, 55, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-violet-400" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
      </div>
    ),
  },
  {
    icon: Globe,
    title: "Branded Storefront",
    description: "Every store gets a unique URL at /shop/your-brand. Customize colors, logo, and banner.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="flex items-center gap-2 rounded-lg border border-border/20 bg-card-2/50 px-3 py-2">
        <Globe className="h-4 w-4 text-blue-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium text-foreground">vbuildcrm.com/shop/your-brand</p>
          <p className="text-[9px] text-muted-foreground">Unique branded link</p>
        </div>
      </div>
    ),
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Ordering",
    description: "One tap sends a pre-formatted order summary to your WhatsApp. Customer just hits send.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="space-y-1.5">
        {[
          { label: "Orders today", value: "18", color: "text-emerald-500" },
          { label: "Avg. order time", value: "15s", color: "text-amber-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/20 bg-card-2/50 px-2.5 py-1.5">
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
            <span className={`text-[10px] font-semibold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Package,
    title: "Order Dashboard",
    description: "Track all orders in one place. Update statuses, manage inventory, and chat with customers.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Pending", value: "4", color: "text-amber-500" },
          { label: "Shipped", value: "8", color: "text-blue-500" },
          { label: "Delivered", value: "23", color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/20 bg-card-2/50 p-2 text-center">
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Track revenue, top products, order trends, and customer insights. Export reports anytime.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Revenue", value: "₹84.2K", change: "+12%" },
          { label: "Conversion", value: "18%", change: "+5%" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border/20 bg-card-2/50 p-2 text-center">
            <p className="text-[9px] text-muted-foreground">{item.label}</p>
            <p className="text-xs font-bold text-foreground">{item.value}</p>
            <p className="text-[9px] text-emerald-500">{item.change}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Auto-pilot Workflows",
    description: "Automate order confirmations, delivery updates, and follow-ups — all via WhatsApp templates.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    chart: (
      <div className="space-y-1.5">
        {[
          { label: "Auto-confirm", value: "Active", color: "text-emerald-500" },
          { label: "Delivery updates", value: "Active", color: "text-emerald-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/20 bg-card-2/50 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <Bell className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
            <span className={`text-[10px] font-medium ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    ),
  },
]

export function ShopFeatures() {
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><ShoppingBag className="h-3 w-3" /> Features</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to Sell on WhatsApp
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From product catalog to delivery — manage your entire store from one dashboard.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bento-card group p-5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                {feature.chart && (
                  <div className="mt-3 rounded-xl border border-border/20 bg-card-2/30 p-3">
                    {feature.chart}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0fe875] border-2 border-gray-900 px-8 text-sm font-bold text-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
          >
            Start Free Trial
            <span className="ml-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
