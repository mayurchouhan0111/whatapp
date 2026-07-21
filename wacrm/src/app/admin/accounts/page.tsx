import { supabaseAdmin } from '@/lib/flows/admin-client'
import Link from 'next/link'
import { Building2, ChevronRight, Blocks } from 'lucide-react'
import { AccountsFilter } from './accounts-filter'

interface AccountRow {
  id: string
  name: string
  owner_user_id: string
  plan_tier: string
  created_at: string
  owner_email?: string
  active_modules: string[]
}

async function getAccounts(): Promise<AccountRow[]> {
  const admin = supabaseAdmin()

  const { data } = await admin
    .from('accounts')
    .select('id, name, owner_user_id, plan_tier, created_at')
    .order('created_at', { ascending: false })

  if (!data) return []

  const accounts = data as AccountRow[]
  const userIds = accounts.map((a) => a.owner_user_id)

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, email')
      .in('user_id', userIds)

    const emailMap = new Map(profiles?.map((p) => [p.user_id, p.email]) ?? [])
    for (const account of accounts) {
      account.owner_email = emailMap.get(account.owner_user_id) ?? 'Unknown'
    }
  }

  const { data: allModules } = await admin
    .from('saas_account_modules')
    .select('account_id, saas_modules(name)')
    .in('account_id', accounts.map(a => a.id))
    .eq('is_active', true)

  const modulesByAccount = new Map<string, string[]>()
  if (allModules) {
    for (const row of allModules as unknown as { account_id: string; saas_modules: { name: string } | null }[]) {
      if (!row.saas_modules?.name) continue
      const accId = row.account_id
      const mods = modulesByAccount.get(accId) || []
      mods.push(row.saas_modules.name)
      modulesByAccount.set(accId, mods)
    }
  }

  for (const account of accounts) {
    account.active_modules = modulesByAccount.get(account.id) || []
  }

  return accounts
}

const PLAN_STYLES: Record<string, string> = {
  free: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  starter: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  growth: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  pro: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  enterprise: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
}

export default async function AdminAccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {accounts.length} workspace{accounts.length !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      <AccountsFilter />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed Up</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="font-medium">No accounts found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Accounts will appear here once registered.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="group hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{account.owner_email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PLAN_STYLES[account.plan_tier] ?? PLAN_STYLES.free}`}>
                        {account.plan_tier}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {account.active_modules.length === 0 ? (
                          <span className="text-xs text-muted-foreground/50 italic">None</span>
                        ) : (
                          account.active_modules.slice(0, 3).map((modName) => (
                            <span key={modName} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                              <Blocks className="h-3 w-3" /> {modName}
                            </span>
                          ))
                        )}
                        {account.active_modules.length > 3 && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            +{account.active_modules.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(account.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/accounts/${account.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                        Manage <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 sm:hidden">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No accounts found</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.owner_email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${PLAN_STYLES[account.plan_tier] ?? PLAN_STYLES.free}`}>
                  {account.plan_tier}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {account.active_modules.length === 0 ? (
                  <span className="text-xs text-muted-foreground/50 italic">No modules</span>
                ) : (
                  account.active_modules.map((modName) => (
                    <span key={modName} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                      {modName}
                    </span>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(account.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <Link href={`/admin/accounts/${account.id}`} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  Manage <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
