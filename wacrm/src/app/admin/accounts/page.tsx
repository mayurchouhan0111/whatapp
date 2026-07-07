import { supabaseAdmin } from '@/lib/flows/admin-client'
import Link from 'next/link'
import { Building2, ChevronRight, CheckCircle2, Blocks } from 'lucide-react'

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

  const accounts: AccountRow[] = data
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

  // Fetch active modules for all these accounts
  const { data: allModules } = await admin
    .from('saas_account_modules')
    .select('account_id, saas_modules(name)')
    .in('account_id', accounts.map(a => a.id))
    .eq('is_active', true)

  const modulesByAccount = new Map<string, string[]>()
  if (allModules) {
    for (const row of allModules as any[]) {
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

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-500/10 text-gray-300 border-gray-500/40',
  growth: 'bg-blue-500/10 text-blue-300 border-blue-500/40',
  professional: 'bg-purple-500/10 text-purple-300 border-purple-500/40',
  enterprise: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
}

export default async function AdminAccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Accounts Directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all {accounts.length} workspaces and their permissions.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Company</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Owner</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Plan</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Active Features</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Signed Up</th>
                <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p>No accounts found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">
                          {account.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {account.owner_email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PLAN_COLORS[account.plan_tier] ?? PLAN_COLORS.starter}`}
                      >
                        {account.plan_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {account.active_modules.length === 0 ? (
                          <span className="text-xs text-muted-foreground/60 italic">None</span>
                        ) : (
                          account.active_modules.map((modName) => (
                            <span key={modName} title={modName} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                              <Blocks className="h-3 w-3" /> {modName}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(account.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/accounts/${account.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground group-hover:border-primary/30 shadow-sm"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4" />
                      </Link>
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
