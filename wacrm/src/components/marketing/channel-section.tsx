import { MessageSquare, ShoppingBag, LayoutDashboard, Zap } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

const channels = [
  { icon: MessageSquare, label: "Shared Inbox", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: ShoppingBag, label: "Storefront", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: LayoutDashboard, label: "Pipelines", color: "text-violet-500", bg: "bg-violet-50" },
  { icon: Zap, label: "Automations", color: "text-amber-500", bg: "bg-amber-50" },
]

export function ChannelSection() {
  return (
    <section className="border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <ScrollReveal delay={100} direction="up" distance={20}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
              Everything your business needs, built for WhatsApp.
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From the first message to final checkout, manage your entire customer journey directly on the world&apos;s most popular messaging app.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {channels.map((ch, idx) => {
            const Icon = ch.icon
            return (
              <ScrollReveal 
                key={ch.label} 
                delay={200 + idx * 80} 
                direction="up" 
                distance={15}
              >
                <div className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ch.bg} ${ch.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 transition-colors group-hover:text-emerald-600">
                    {ch.label}
                  </span>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
