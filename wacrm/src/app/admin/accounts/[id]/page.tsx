import { notFound, redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { getPlanDefaults, type PlanTier } from '@/lib/billing/limits'
import { revalidatePath } from 'next/cache'
import { AccountForm } from './account-form'

export interface AccountDetail {
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

export interface SaasModule {
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

  const { data: activeModules } = await admin
    .from('saas_account_modules')
    .select('module_id')
    .eq('account_id', id)
    .eq('is_active', true)

  account.active_module_ids = (activeModules || []).map((m: any) => m.module_id)

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

  const { data: ownerRole } = await admin
    .from('saas_roles')
    .select('id')
    .eq('account_id', accountId)
    .ilike('name', 'owner')
    .limit(1)
    .maybeSingle()

  if (ownerRole) {
    const { data: activeModules } = await admin
      .from('saas_account_modules')
      .select('module_id')
      .eq('account_id', accountId)
      .eq('is_active', true)

    if (activeModules && activeModules.length > 0) {
      const activeModIds = activeModules.map((m) => m.module_id)
      const { data: permissions } = await admin
        .from('saas_permissions')
        .select('id')
        .in('module_id', activeModIds)

      if (permissions && permissions.length > 0) {
        const permInserts = permissions.map((p) => ({
          role_id: ownerRole.id,
          permission_id: p.id,
        }))
        await admin
          .from('saas_role_permissions')
          .upsert(permInserts, { onConflict: 'role_id,permission_id' })
      }
    }
  }

  await admin.from('saas_account_limit_usage').upsert(
    { account_id: accountId, limit_id: 'contacts', remaining: maxContacts },
    { onConflict: 'account_id,limit_id' }
  )

  revalidatePath(`/admin/accounts/${accountId}`)
  redirect(`/admin/accounts/${accountId}?updated=true`)
}

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

  return (
    <AccountForm
      account={account}
      allModules={allModules}
      updateAccount={updateAccount}
      updated={updated === 'true'}
    />
  )
}
