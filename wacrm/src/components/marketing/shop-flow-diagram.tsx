import { ShoppingBag, ShoppingCart, ClipboardList, CreditCard, Send, PackageCheck } from "lucide-react"

const steps = [
  {
    icon: ShoppingBag,
    title: "Browse Products",
    description: "Customers visit your branded storefront at /shop/your-brand, browse by category, and search products.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/20",
  },
  {
    icon: ShoppingCart,
    title: "Add to Cart",
    description: "Select items with quantity controls. Real-time subtotal, delivery fee, and savings badges.",
    gradient: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/20",
  },
  {
    icon: ClipboardList,
    title: "Checkout Details",
    description: "Customer fills name, WhatsApp number, and delivery address. All fields validated instantly.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: CreditCard,
    title: "Choose Payment",
    description: "UPI (display QR/ID) or Cash on Delivery. Free delivery above ₹300, minimal handling fee.",
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Send,
    title: "Order via WhatsApp",
    description: "One tap opens WhatsApp with a pre-formatted order summary. Customer just hits send.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: PackageCheck,
    title: "Confirm & Deliver",
    description: "Order appears in your dashboard. Update status: Pending → Confirmed → Delivered. Chat with customer.",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
  },
]

export function ShopFlowDiagram() {
  return (
    <div className="relative">
      <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:block" />

      <div className="space-y-8 md:space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isLast = i === steps.length - 1

          return (
            <div key={step.title} className="group relative md:flex md:items-start md:gap-8">
              <div className="mb-4 hidden md:flex md:w-16 md:flex-col md:items-center">
                <div
                  className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${step.borderColor}`}
                >
                  <Icon className={`h-6 w-6 ${step.iconColor}`} />
                </div>
                {!isLast && (
                  <div className="mt-2 h-full w-px bg-gradient-to-b from-border to-transparent" />
                )}
              </div>

              <div
                className={`relative flex-1 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:ml-0 ${!isLast ? "mb-0" : ""}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative flex items-start gap-4 md:hidden">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} ${step.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <div className="relative hidden md:block">
                  <div className="absolute -top-6 left-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shadow-sm">
                    {i + 1}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
