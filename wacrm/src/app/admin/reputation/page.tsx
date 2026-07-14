import { supabaseAdmin } from '@/lib/flows/admin-client'
import { Star, Users, Activity, BarChart3, ExternalLink } from 'lucide-react'
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

export default async function AdminReputationPage() {
  const stats = await getReputationStats()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Reputation Module</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide Google Review Feedback analytics and account overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm border border-border text-amber-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{stats.totalReviewRequests}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Total Review Requests</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm border border-border text-yellow-500">
              <Star className="h-6 w-6" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{stats.totalRated}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Ratings Submitted</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm border border-border text-emerald-500">
              <ExternalLink className="h-6 w-6" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{stats.totalClicked}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Google Review Clicks</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm border border-border text-blue-500">
              <Users className="h-6 w-6" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{stats.accounts.length}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Accounts with Reputation</p>
          </div>
        </div>
      </div>

      {/* Accounts with reputation enabled */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Accounts with Reputation Active</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Requests</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.accounts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No accounts have the reputation module enabled yet.
                  </td>
                </tr>
              ) : (
                stats.accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/accounts/${acc.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {acc.name || 'Unnamed Account'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{acc.max_review_requests?.toLocaleString() || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/accounts/${acc.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        View Account <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Recent Review Activity</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No review requests yet.
                  </td>
                </tr>
              ) : (
                stats.recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">{req.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        req.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                        req.status === 'opened' ? 'bg-amber-500/10 text-amber-500' :
                        req.status === 'clicked' ? 'bg-emerald-500/10 text-emerald-500' :
                        req.status === 'rated' ? 'bg-green-500/10 text-green-500' :
                        req.status === 'failed' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{req.rating ? `${req.rating}★` : '—'}</td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
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
