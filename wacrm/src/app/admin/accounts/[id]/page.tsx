import { notFound, redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { getPlanDefaults, type PlanTier } from '@/lib/billing/limits'
import { revalidatePath } from 'next/cache'

interface AccountDetail {
  id: string
  name: string
  owner_user_id: string
  plan_tier: PlanTier
  max_users: number
  max_contacts: number
  max_pipelines: number
  max_active_flows: number
  max_broadcasts_per_month: number
  allow_flows: boolean
  allow_api_access: boolean
  allow_white_label: boolean
  allow_store?: boolean
  store_expires_at?: string | null
  max_products?: number
  max_orders_per_month?: number
  created_at: string
  updated_at: string
  owner_email?: string
}

async function getAccount(id: string): Promise<AccountDetail | null> {
  const admin = supabaseAdmin()

  const { data } = await admin
    .from('accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!data) return null

  const account = data as AccountDetail

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('user_id', account.owner_user_id)
    .maybeSingle()

  account.owner_email = profile?.email ?? 'Unknown'
  return account
}

async function updateAccount(formData: FormData) {
  'use server'

  const accountId = formData.get('account_id') as string
  const planTier = formData.get('plan_tier') as PlanTier

  const admin = supabaseAdmin()

  const defaults = getPlanDefaults(planTier) as any

  const maxUsers = parseInt(formData.get('max_users') as string, 10) || defaults.max_users
  const maxContacts = parseInt(formData.get('max_contacts') as string, 10) || defaults.max_contacts
  const maxPipelines = parseInt(formData.get('max_pipelines') as string, 10) || defaults.max_pipelines
  const maxActiveFlows = parseInt(formData.get('max_active_flows') as string, 10) || defaults.max_active_flows
  const maxBroadcasts = parseInt(formData.get('max_broadcasts_per_month') as string, 10) || defaults.max_broadcasts_per_month
  const maxProducts = parseInt(formData.get('max_products') as string, 10) || defaults.max_products || 0
  const maxOrders = parseInt(formData.get('max_orders_per_month') as string, 10) || defaults.max_orders_per_month || 0

  const allowFlows = formData.get('allow_flows') === 'on'
  const allowApiAccess = formData.get('allow_api_access') === 'on'
  const allowWhiteLabel = formData.get('allow_white_label') === 'on'
  const allowStore = formData.get('allow_store') === 'on'

  const storeExpiresAtInput = formData.get('store_expires_at') as string
  const storeExpiresAt = storeExpiresAtInput ? new Date(storeExpiresAtInput).toISOString() : null

  const { error } = await admin
    .from('accounts')
    .update({
      plan_tier: planTier,
      max_users: maxUsers,
      max_contacts: maxContacts,
      max_pipelines: maxPipelines,
      max_active_flows: maxActiveFlows,
      max_broadcasts_per_month: maxBroadcasts,
      allow_flows: allowFlows,
      allow_api_access: allowApiAccess,
      allow_white_label: allowWhiteLabel,
      allow_store: allowStore,
      store_expires_at: storeExpiresAt,
      max_products: maxProducts,
      max_orders_per_month: maxOrders,
    })
    .eq('id', accountId)

  if (error) {
    console.error('[admin] account update failed:', error.message)
    throw new Error('Failed to update account: ' + error.message)
  }

  revalidatePath(`/admin/accounts/${accountId}`)
  redirect(`/admin/accounts/${accountId}?updated=true`)
}

const PLAN_TIERS: PlanTier[] = ['starter', 'growth', 'professional', 'enterprise']

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}) {
  const { id } = await params
  const { updated } = await searchParams
  const account = await getAccount(id)

  if (!account) {
    notFound()
  }

  const defaults = getPlanDefaults(account.plan_tier) as any

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{account.name}</h2>
        <p className="text-sm text-muted-foreground">
          Owner: {account.owner_email} &middot; Created:{' '}
          {new Date(account.created_at).toLocaleDateString()}
        </p>
      </div>

      {updated === 'true' && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Account updated successfully.
        </div>
      )}

      <form action={updateAccount}>
        <input type="hidden" name="account_id" value={account.id} />

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Plan & Limits
            </h3>
            <p className="text-sm text-muted-foreground">
              Changing the plan tier pre-fills the default limits for that
              tier. You can override individual values below.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="plan_tier" className="text-sm font-medium text-foreground">Plan Tier</label>
              <select
                id="plan_tier"
                name="plan_tier"
                defaultValue={account.plan_tier}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PLAN_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="max_users" className="text-sm font-medium text-foreground">Max Users</label>
              <input
                id="max_users"
                name="max_users"
                type="number"
                min={1}
                defaultValue={account.max_users}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_users}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="max_contacts" className="text-sm font-medium text-foreground">Max Contacts</label>
              <input
                id="max_contacts"
                name="max_contacts"
                type="number"
                min={1}
                defaultValue={account.max_contacts}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_contacts.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="max_pipelines" className="text-sm font-medium text-foreground">Max Pipelines</label>
              <input
                id="max_pipelines"
                name="max_pipelines"
                type="number"
                min={1}
                defaultValue={account.max_pipelines}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_pipelines}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="max_active_flows" className="text-sm font-medium text-foreground">Max Active Flows</label>
              <input
                id="max_active_flows"
                name="max_active_flows"
                type="number"
                min={0}
                defaultValue={account.max_active_flows}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_active_flows}
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="max_broadcasts_per_month" className="text-sm font-medium text-foreground">
                Max Broadcasts / Month
              </label>
              <input
                id="max_broadcasts_per_month"
                name="max_broadcasts_per_month"
                type="number"
                min={1}
                defaultValue={account.max_broadcasts_per_month}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_broadcasts_per_month.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="max_products" className="text-sm font-medium text-foreground">
                Max Store Products
              </label>
              <input
                id="max_products"
                name="max_products"
                type="number"
                min={0}
                defaultValue={account.max_products ?? defaults.max_products ?? 0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_products ?? 0}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="max_orders_per_month" className="text-sm font-medium text-foreground">
                Max Store Orders / Month
              </label>
              <input
                id="max_orders_per_month"
                name="max_orders_per_month"
                type="number"
                min={0}
                defaultValue={account.max_orders_per_month ?? defaults.max_orders_per_month ?? 0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: {defaults.max_orders_per_month ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6 mt-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Feature Toggles
            </h3>
            <p className="text-sm text-muted-foreground">
              Enable or disable features for this account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allow_flows" className="font-medium text-foreground">
                  Chatbot Flows
                </label>
                <p className="text-xs text-muted-foreground">
                  Allow the account to create and activate chatbot flows.
                </p>
              </div>
              <input
                type="checkbox"
                id="allow_flows"
                name="allow_flows"
                defaultChecked={account.allow_flows}
                className="h-4 w-4 rounded border-input"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allow_api_access" className="font-medium text-foreground">
                  API Access
                </label>
                <p className="text-xs text-muted-foreground">
                  Allow the account to create API keys for programmatic access.
                </p>
              </div>
              <input
                type="checkbox"
                id="allow_api_access"
                name="allow_api_access"
                defaultChecked={account.allow_api_access}
                className="h-4 w-4 rounded border-input"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allow_white_label" className="font-medium text-foreground">
                  White-labeling
                </label>
                <p className="text-xs text-muted-foreground">
                  Allow the account to remove branding and use a custom domain.
                </p>
              </div>
              <input
                type="checkbox"
                id="allow_white_label"
                name="allow_white_label"
                defaultChecked={account.allow_white_label}
                className="h-4 w-4 rounded border-input"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allow_store" className="font-medium text-foreground">
                  Storefront Access
                </label>
                <p className="text-xs text-muted-foreground">
                  Allow the account to have an online store and customize their catalog.
                </p>
              </div>
              <input
                type="checkbox"
                id="allow_store"
                name="allow_store"
                defaultChecked={account.allow_store}
                className="h-4 w-4 rounded border-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <label htmlFor="store_expires_at" className="font-medium text-foreground">
                  Storefront Subscription Expiry
                </label>
                <p className="text-xs text-muted-foreground">
                  Set storefront license expiration date. Leave blank for no expiration (permanent).
                </p>
              </div>
              <input
                type="datetime-local"
                id="store_expires_at"
                name="store_expires_at"
                defaultValue={account.store_expires_at ? new Date(account.store_expires_at).toISOString().slice(0, 16) : ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

