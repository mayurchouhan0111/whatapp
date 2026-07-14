'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Building2, LogOut, IndianRupee, QrCode, Star } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/accounts', label: 'Accounts', icon: Building2 },
  { href: '/admin/reputation', label: 'Reputation', icon: Star },
  { href: '/admin/payments', label: 'Payments', icon: IndianRupee },
  { href: '/admin/payments/settings', label: 'UPI Settings', icon: QrCode },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <img src="/logo.png" alt="Vbuild CRM" className="h-9 w-auto max-w-[130px] object-contain" />
          <span className="text-sm font-semibold text-foreground">Super Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
