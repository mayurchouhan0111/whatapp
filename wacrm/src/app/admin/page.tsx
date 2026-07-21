import { supabaseAdmin } from '@/lib/flows/admin-client'
import { Building2, Users, Radio, CreditCard, Activity, Star, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

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
      label: 'Total Accounts', value: stats.totalAccounts, icon: Building2,
      color: 'text-violet-400', bg: 'bg-violet-500/10',
      trend: '+3', up: true,
    },
    {
      label: 'Total Users', value: stats.totalProfiles, icon: Users,
      color: 'text-blue-400', bg: 'bg-blue-500/10',
      trend: '+12', up: true,
    },
    {
      label: 'Contacts', value: stats.totalContacts, icon: Activity,
      color: 'text-emerald-400', bg: 'bg-emerald-500/10',
      trend: '+8', up: true,
    },
    {
      label: 'Paid Subscriptions', value: stats.paidAccounts, icon: CreditCard,
      color: 'text-amber-400', bg: 'bg-amber-500/10',
      trend: '+1', up: true,
    },
    {
      label: 'Messages Sent', value: stats.totalMessages.toLocaleString(), icon: Radio,
      color: 'text-rose-400', bg: 'bg-rose-500/10',
      trend: '-5%', up: false,
    },
    {
      label: 'Review Requests', value: stats.totalReviewRequests.toLocaleString(), icon: Star,
      color: 'text-amber-400', bg: 'bg-amber-500/10',
      trend: '+18%', up: true,
    },
    {
      label: 'Ratings Collected', value: stats.totalRatings.toLocaleString(), icon: BarChart3,
      color: 'text-yellow-400', bg: 'bg-yellow-500/10',
      trend: '+22%', up: true,
    },
  ]

  const paidPercent = Math.round((stats.paidAccounts / Math.max(stats.totalAccounts, 1)) * 100)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide overview and key performance indicators.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${card.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {card.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Plan Distribution</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-foreground">{stats.paidAccounts}</span>
            <span className="text-sm text-muted-foreground">of {stats.totalAccounts} accounts on a paid plan</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-1000 ease-in-out"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Free: {stats.totalAccounts - stats.paidAccounts}</span>
            <span className="font-semibold text-foreground">{paidPercent}% Conversion</span>
            <span>Paid: {stats.paidAccounts}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
