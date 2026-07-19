"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ListOrdered, Grid3X3, Users, CreditCard, Settings, Eye } from "lucide-react"

const tabs = [
  { href: "/store", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/store/products", label: "Products", icon: Package },
  { href: "/store/orders", label: "Orders", icon: ListOrdered },
  { href: "/store/categories", label: "Categories", icon: Grid3X3 },
  { href: "/store/customers", label: "Customers", icon: Users },
  { href: "/store/payments", label: "Payments", icon: CreditCard },
  { href: "/store/recognition", label: "AI Recognition", icon: Eye },
  { href: "/store/settings", label: "Store Settings", icon: Settings },
]

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href) && (tab.href === "/store" ? pathname === "/store" : true)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}
