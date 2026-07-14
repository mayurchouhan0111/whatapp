import { supabaseAdmin } from '@/lib/flows/admin-client'
import { Building2, Users, Radio, CreditCard, Activity, Contact, Star, StarHalf } from 'lucide-react'

async function getDashboardStats() {
  const admin = supabaseAdmin()

  const [
    { count: totalAccounts },
    { count: totalProfiles },
    { count: totalMessages },
    { count: totalContacts },
    { count: totalReviewRequests },
    { count: totalRatings },
  ] = await Promise.all([
    admin.from('accounts').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('messages').select('*', { count: 'exact', head: true }),
    admin.from('contacts').select('*', { count: 'exact', head: true }),
    admin.from('review_requests').select('*', { count: 'exact', head: true }),
    admin.from('review_requests').select('*', { count: 'exact', head: true }).not('rating', 'is', null),
  ])

  const { count: paidAccounts } = await admin
    .from('saas_subscriptions')
    .select('id, saas_plans!inner(price)', { count: 'exact', head: true })
    .in('status', ['active', 'trialing'])
    .gt('saas_plans.price', 0)

  return {
    totalAccounts: totalAccounts ?? 0,
    totalProfiles: totalProfiles ?? 0,
    totalMessages: totalMessages ?? 0,
    totalContacts: totalContacts ?? 0,
    totalReviewRequests: totalReviewRequests ?? 0,
    totalRatings: totalRatings ?? 0,
    paidAccounts: paidAccounts ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    {
      label: 'Total Accounts',
      value: stats.totalAccounts,
      icon: Building2,
      gradient: 'from-blue-500/20 to-blue-500/5',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Total Users',
      value: stats.totalProfiles,
      icon: Users,
      gradient: 'from-purple-500/20 to-purple-500/5',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Total Contacts',
      value: stats.totalContacts,
      icon: Contact,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Paid Subs',
      value: stats.paidAccounts,
      icon: CreditCard,
      gradient: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Messages',
      value: stats.totalMessages.toLocaleString(),
      icon: Radio,
      gradient: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-500',
    },
    {
      label: 'Review Requests',
      value: stats.totalReviewRequests.toLocaleString(),
      icon: Star,
      gradient: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Ratings Collected',
      value: stats.totalRatings.toLocaleString(),
      icon: StarHalf,
      gradient: 'from-yellow-500/20 to-yellow-500/5',
      iconColor: 'text-yellow-500',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide KPIs and performance metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm border border-border ${card.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">
              Plan Distribution & Revenue Drivers
            </h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{stats.paidAccounts}</span> of <span className="font-semibold text-foreground">{stats.totalAccounts}</span> accounts are on a paid plan.
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-in-out"
              style={{ width: `${Math.round((stats.paidAccounts / Math.max(stats.totalAccounts, 1)) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-muted-foreground text-right">
            {Math.round((stats.paidAccounts / Math.max(stats.totalAccounts, 1)) * 100)}% Conversion Rate
          </p>
        </div>
      </div>
    </div>
  )
}
