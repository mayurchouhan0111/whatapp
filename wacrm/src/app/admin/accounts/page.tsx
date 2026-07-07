import { supabaseAdmin } from '@/lib/flows/admin-client'
import Link from 'next/link'
import { Building2, ChevronRight } from 'lucide-react'

interface AccountRow {
  id: string
  name: string
  owner_user_id: string
  plan_tier: string
  created_at: string
  owner_email?: string
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Accounts</h2>
        <p className="text-sm text-muted-foreground">
          All registered workspaces ({accounts.length} total).
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Company
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Owner
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Signed Up
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {account.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {account.owner_email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${PLAN_COLORS[account.plan_tier] ?? PLAN_COLORS.starter}`}
                      >
                        {account.plan_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/accounts/${account.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        Manage
                        <ChevronRight className="h-3.5 w-3.5" />
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
