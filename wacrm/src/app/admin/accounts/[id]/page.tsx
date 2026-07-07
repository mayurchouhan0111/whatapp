import { notFound, redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { getPlanDefaults, type PlanTier } from '@/lib/billing/limits'
import { revalidatePath } from 'next/cache'
import { ShieldAlert, Cpu, Palette, Store, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  allow_api_access: boolean
  allow_white_label: boolean
  max_products?: number
  max_orders_per_month?: number
  created_at: string
  updated_at: string
  owner_email?: string
  active_module_ids: string[]
  used_contacts: number
}

interface SaasModule {
  id: string
  key: string
  name: string
  description: string
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

  // Fetch active modules
  const { data: activeModules } = await admin
    .from('saas_account_modules')
    .select('module_id')
    .eq('account_id', id)
    .eq('is_active', true)

  account.active_module_ids = (activeModules || []).map((m: any) => m.module_id)

  // Fetch exact contact usage
  const { data: limitUsage } = await admin
    .from('saas_account_limit_usage')
    .select('used')
    .eq('account_id', id)
    .eq('limit_id', 'contacts')
    .maybeSingle()

  account.used_contacts = limitUsage?.used ?? 0

  return account
}

async function getAllModules(): Promise<SaasModule[]> {
  const admin = supabaseAdmin()
  const { data } = await admin.from('saas_modules').select('*').order('name')
  return (data || []) as SaasModule[]
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

  const allowApiAccess = formData.get('allow_api_access') === 'on'
  const allowWhiteLabel = formData.get('allow_white_label') === 'on'

  const { error } = await admin
    .from('accounts')
    .update({
      plan_tier: planTier,
      max_users: maxUsers,
      max_contacts: maxContacts,
      max_pipelines: maxPipelines,
      max_active_flows: maxActiveFlows,
      max_broadcasts_per_month: maxBroadcasts,
      allow_api_access: allowApiAccess,
      allow_white_label: allowWhiteLabel,
      max_products: maxProducts,
      max_orders_per_month: maxOrders,
    })
    .eq('id', accountId)

  if (error) {
    console.error('[admin] account update failed:', error.message)
    throw new Error('Failed to update account: ' + error.message)
  }

  // Handle module toggles
  const allModuleIds = (formData.get('all_module_ids') as string || '').split(',').filter(Boolean)
  for (const mid of allModuleIds) {
    const isActive = formData.get(`module_${mid}`) === 'on'
    await admin
      .from('saas_account_modules')
      .upsert(
        { account_id: accountId, module_id: mid, is_active: isActive },
        { onConflict: 'account_id,module_id' }
      )
  }

  // Ensure limit_usage exists or gets updated limit
  await admin.from('saas_account_limit_usage').upsert(
    { account_id: accountId, limit_id: 'contacts', remaining: maxContacts },
    { onConflict: 'account_id,limit_id' }
  )

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
  const allModules = await getAllModules()

  if (!account) {
    notFound()
  }

  const defaults = getPlanDefaults(account.plan_tier) as any

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/accounts"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{account.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Managed by <span className="font-medium text-foreground">{account.owner_email}</span> &middot; Created {new Date(account.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {updated === 'true' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-200">
            Account settings and permissions updated successfully.
          </p>
        </div>
      )}

      <form action={updateAccount} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <input type="hidden" name="account_id" value={account.id} />
        <input type="hidden" name="all_module_ids" value={allModules.map(m => m.id).join(',')} />

        {/* Feature Permissions / Pages - Making this the highlight as requested */}
        <div className="lg:col-span-12">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-primary" />
                Page & Feature Permissions
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Toggle which sections and capabilities this account can access.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {allModules.map((mod) => {
                const isChecked = account.active_module_ids.includes(mod.id)
                return (
                  <label key={mod.id} className="relative flex cursor-pointer flex-col rounded-xl border border-border bg-background p-6 hover:bg-muted/30 hover:border-primary/50 transition-all [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:ring-1 [&:has(:checked)]:ring-primary">
                    <input
                      type="checkbox"
                      name={`module_${mod.id}`}
                      defaultChecked={isChecked}
                      className="sr-only"
                    />
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">{mod.name}</span>
                      <span className="text-xs text-muted-foreground">{mod.description || 'Enterprise Module'}</span>
                    </div>
                    <div className="absolute right-4 top-4 opacity-0 transition-opacity [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-primary [.relative:has(:checked)_&]:opacity-100">
                      <Check />
                    </div>
                  </label>
                )
              })}

              {/* Legacy API/Whitelabel settings that don't have modules yet */}
              <label className="relative flex cursor-pointer flex-col rounded-xl border border-border bg-background p-6 hover:bg-muted/30 hover:border-primary/50 transition-all [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:ring-1 [&:has(:checked)]:ring-primary">
                <input
                  type="checkbox"
                  name="allow_api_access"
                  defaultChecked={account.allow_api_access}
                  className="sr-only"
                />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Cpu className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">API Access</span>
                  <span className="text-xs text-muted-foreground">Enables programmatic access.</span>
                </div>
                <div className="absolute right-4 top-4 opacity-0 transition-opacity [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-primary [.relative:has(:checked)_&]:opacity-100">
                  <Check />
                </div>
              </label>

              <label className="relative flex cursor-pointer flex-col rounded-xl border border-border bg-background p-6 hover:bg-muted/30 hover:border-primary/50 transition-all [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:ring-1 [&:has(:checked)]:ring-primary">
                <input
                  type="checkbox"
                  name="allow_white_label"
                  defaultChecked={account.allow_white_label}
                  className="sr-only"
                />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <Palette className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">White-label</span>
                  <span className="text-xs text-muted-foreground">Removes branding.</span>
                </div>
                <div className="absolute right-4 top-4 opacity-0 transition-opacity [&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-primary [.relative:has(:checked)_&]:opacity-100">
                  <Check />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="lg:col-span-12">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Usage Limits & Quotas
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Changing the tier pre-fills limits, but you can override specific quotas.
              </p>
            </div>

            <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <label htmlFor="plan_tier" className="block text-sm font-semibold text-foreground mb-1">Base Plan Tier</label>
                <select
                  id="plan_tier"
                  name="plan_tier"
                  defaultValue={account.plan_tier}
                  className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {PLAN_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="max_contacts" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Max Contacts (Used: {account.used_contacts.toLocaleString()})
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_contacts.toLocaleString()}</span>
                </label>
                <input
                  id="max_contacts"
                  name="max_contacts"
                  type="number"
                  min={1}
                  defaultValue={account.max_contacts}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="max_users" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Max Team Users
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_users}</span>
                </label>
                <input
                  id="max_users"
                  name="max_users"
                  type="number"
                  min={1}
                  defaultValue={account.max_users}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="max_pipelines" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Max Pipelines
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_pipelines}</span>
                </label>
                <input
                  id="max_pipelines"
                  name="max_pipelines"
                  type="number"
                  min={1}
                  defaultValue={account.max_pipelines}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="max_active_flows" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Active Flows Limit
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_active_flows}</span>
                </label>
                <input
                  id="max_active_flows"
                  name="max_active_flows"
                  type="number"
                  min={0}
                  defaultValue={account.max_active_flows}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label htmlFor="max_broadcasts_per_month" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Monthly Broadcast Limit
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_broadcasts_per_month.toLocaleString()}</span>
                </label>
                <input
                  id="max_broadcasts_per_month"
                  name="max_broadcasts_per_month"
                  type="number"
                  min={1}
                  defaultValue={account.max_broadcasts_per_month}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>

            <hr className="my-8 border-border" />

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground">Storefront Limits</h4>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="max_products" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Max Products
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_products ?? 0}</span>
                </label>
                <input
                  id="max_products"
                  name="max_products"
                  type="number"
                  min={0}
                  defaultValue={account.max_products ?? defaults.max_products ?? 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="max_orders_per_month" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Orders / Month
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Default: {defaults.max_orders_per_month ?? 0}</span>
                </label>
                <input
                  id="max_orders_per_month"
                  name="max_orders_per_month"
                  type="number"
                  min={0}
                  defaultValue={account.max_orders_per_month ?? defaults.max_orders_per_month ?? 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="store_expires_at" className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Store Expiry
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">Optional</span>
                </label>
                <input
                  type="datetime-local"
                  id="store_expires_at"
                  name="store_expires_at"
                  defaultValue={account.store_expires_at ? new Date(account.store_expires_at).toISOString().slice(0, 16) : ""}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 flex justify-end gap-4 mb-20">
          <Link
            href="/admin/accounts"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-input bg-background px-6 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            Save Account Settings
          </button>
        </div>
      </form>
    </div>
  )
}
