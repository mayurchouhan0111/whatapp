import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import Link from 'next/link'
import { LayoutDashboard, Building2, Shield, LogOut } from 'lucide-react'

async function checkSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const admin = supabaseAdmin()
  const { data } = await admin
    .from('profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  return data?.is_super_admin === true
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isSuperAdmin = await checkSuperAdmin()
  if (!isSuperAdmin) {
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Super Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/accounts"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Building2 className="h-4 w-4" />
                Accounts
              </Link>
            </li>
          </ul>
        </nav>
        <div className="shrink-0 border-t border-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-6">
          <h1 className="text-base font-semibold text-foreground">
            Admin Panel
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
