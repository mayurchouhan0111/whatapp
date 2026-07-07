import { supabaseAdmin } from '@/lib/flows/admin-client'
import { Building2, Users, Radio, CreditCard, Activity } from 'lucide-react'

async function getDashboardStats() {
  const admin = supabaseAdmin()

  const [
    { count: totalAccounts },
    { count: totalProfiles },
    { count: totalMessages },
  ] = await Promise.all([
    admin.from('accounts').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('messages').select('*', { count: 'exact', head: true }),
  ])

  const { count: growthOrHigher } = await admin
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .not('plan_tier', 'eq', 'starter')

  return {
    totalAccounts: totalAccounts ?? 0,
    totalProfiles: totalProfiles ?? 0,
    totalMessages: totalMessages ?? 0,
    paidAccounts: growthOrHigher ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    {
      label: 'Total Accounts',
      value: stats.totalAccounts,
      icon: Building2,
    },
    {
      label: 'Total Users',
      value: stats.totalProfiles,
      icon: Users,
    },
    {
      label: 'Paid Subscriptions',
      value: stats.paidAccounts,
      icon: CreditCard,
    },
    {
      label: 'Messages Processed',
      value: stats.totalMessages.toLocaleString(),
      icon: Radio,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Platform-wide KPIs at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            Plan Distribution
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.paidAccounts} of {stats.totalAccounts} accounts are on a paid
          plan ({Math.round((stats.paidAccounts / Math.max(stats.totalAccounts, 1)) * 100)}%).
        </p>
      </div>
    </div>
  )
}
