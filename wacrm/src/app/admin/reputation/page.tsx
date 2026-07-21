import { supabaseAdmin } from '@/lib/flows/admin-client'
import { Star, Users, Activity, ExternalLink, Mail, MousePointerClick } from 'lucide-react'
import Link from 'next/link'

async function getReputationStats() {
  const admin = supabaseAdmin()

  const { data: perAccount } = await admin
    .from('accounts')
    .select('id, name, allow_reputation, max_review_requests')
    .eq('allow_reputation', true)
    .order('name')

  const { data: totalRequests } = await admin
    .from('review_requests')
    .select('id, account_id, status, rating, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: totalReviewRequests } = await admin
    .from('review_requests')
    .select('*', { count: 'exact', head: true })

  const { count: totalRated } = await admin
    .from('review_requests')
    .select('*', { count: 'exact', head: true })
    .not('rating', 'is', null)

  const { count: totalClicked } = await admin
    .from('review_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'clicked')

  return {
    accounts: perAccount || [],
    recentRequests: totalRequests || [],
    totalReviewRequests: totalReviewRequests ?? 0,
    totalRated: totalRated ?? 0,
    totalClicked: totalClicked ?? 0,
  }
}

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  opened: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  clicked: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rated: 'bg-green-500/10 text-green-400 border-green-500/30',
  failed: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
}

export default async function AdminReputationPage() {
  const stats = await getReputationStats()

  const rate = stats.totalReviewRequests > 0
    ? Math.round((stats.totalRated / stats.totalReviewRequests) * 100)
    : 0
  const clickRate = stats.totalReviewRequests > 0
    ? Math.round((stats.totalClicked / stats.totalReviewRequests) * 100)
    : 0

  const kpiCards = [
    {
      label: 'Total Requests', value: stats.totalReviewRequests, icon: Mail,
      color: 'text-amber-400', bg: 'bg-amber-500/10',
    },
    {
      label: 'Ratings Submitted', value: stats.totalRated, icon: Star,
      color: 'text-yellow-400', bg: 'bg-yellow-500/10',
      sub: `${rate}% rate`,
    },
    {
      label: 'Google Clicks', value: stats.totalClicked, icon: MousePointerClick,
      color: 'text-emerald-400', bg: 'bg-emerald-500/10',
      sub: `${clickRate}% click rate`,
    },
    {
      label: 'Active Accounts', value: stats.accounts.length, icon: Users,
      color: 'text-blue-400', bg: 'bg-blue-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reputation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Google Review Feedback analytics across all accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {card.label}
                {card.sub && <span className="ml-1.5 text-emerald-400">{card.sub}</span>}
              </p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Accounts with Reputation Active</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Requests</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.accounts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No accounts with the reputation module enabled.
                  </td>
                </tr>
              ) : (
                stats.accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/accounts/${acc.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {acc.name || 'Unnamed Account'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{acc.max_review_requests?.toLocaleString() || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/accounts/${acc.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Recent Review Activity</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No review requests yet.
                  </td>
                </tr>
              ) : (
                stats.recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">#{req.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[req.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          req.status === 'sent' ? 'bg-blue-400' :
                          req.status === 'opened' ? 'bg-amber-400' :
                          req.status === 'clicked' ? 'bg-emerald-400' :
                          req.status === 'rated' ? 'bg-green-400' :
                          req.status === 'failed' ? 'bg-rose-400' :
                          'bg-gray-400'
                        }`} />
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{req.rating ? <span className="text-yellow-400">{req.rating} ★</span> : '—'}</td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
