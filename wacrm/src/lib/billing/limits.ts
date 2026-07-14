import { supabaseAdmin } from '@/lib/flows/admin-client'

export type PlanTier = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise'

export type LimitType =
  | 'users'
  | 'contacts'
  | 'pipelines'
  | 'active_flows'
  | 'broadcasts_per_month'
  | 'products'
  | 'orders_per_month'
  | 'review_requests_per_month'

export type FeatureGate =
  | 'flows'
  | 'api_access'
  | 'white_label'
  | 'store'
  | 'reputation'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  message?: string
}

export interface AccountLimits {
  plan_tier: PlanTier
  max_users: number
  max_contacts: number
  max_pipelines: number
  max_active_flows: number
  max_broadcasts_per_month: number
  allow_flows: boolean
  allow_api_access: boolean
  allow_white_label: boolean
  allow_store: boolean
  allow_reputation: boolean
  store_expires_at: string | null
  max_products: number
  max_orders_per_month: number
  max_review_requests: number
}

const PLAN_DEFAULTS: Record<PlanTier, Omit<AccountLimits, 'plan_tier'>> = {
  free: {
    max_users: 1,
    max_contacts: 500,
    max_pipelines: 1,
    max_active_flows: 0,
    max_broadcasts_per_month: 100,
    allow_flows: false,
    allow_api_access: false,
    allow_white_label: false,
    allow_store: false,
    allow_reputation: false,
    store_expires_at: null,
    max_products: 0,
    max_orders_per_month: 0,
    max_review_requests: 0,
  },
  starter: {
    max_users: 3,
    max_contacts: 2500,
    max_pipelines: 2,
    max_active_flows: 1,
    max_broadcasts_per_month: 1000,
    allow_flows: true,
    allow_api_access: false,
    allow_white_label: false,
    allow_store: true,
    allow_reputation: true,
    store_expires_at: null,
    max_products: 50,
    max_orders_per_month: 100,
    max_review_requests: 50,
  },
  growth: {
    max_users: 10,
    max_contacts: 15_000,
    max_pipelines: 5,
    max_active_flows: 10,
    max_broadcasts_per_month: 10_000,
    allow_flows: true,
    allow_api_access: true,
    allow_white_label: false,
    allow_store: true,
    allow_reputation: true,
    store_expires_at: null,
    max_products: 500,
    max_orders_per_month: 1000,
    max_review_requests: 500,
  },
  pro: {
    max_users: 25,
    max_contacts: 50_000,
    max_pipelines: 999,
    max_active_flows: 999,
    max_broadcasts_per_month: 50_000,
    allow_flows: true,
    allow_api_access: true,
    allow_white_label: false,
    allow_store: true,
    allow_reputation: true,
    store_expires_at: null,
    max_products: 2500,
    max_orders_per_month: 5000,
    max_review_requests: 5000,
  },
  enterprise: {
    max_users: 9_999,
    max_contacts: 999_999,
    max_pipelines: 999,
    max_active_flows: 999,
    max_broadcasts_per_month: 9_999_999,
    allow_flows: true,
    allow_api_access: true,
    allow_white_label: true,
    allow_store: true,
    allow_reputation: true,
    store_expires_at: null,
    max_products: 9999,
    max_orders_per_month: 99999,
    max_review_requests: 999999,
  },
}

export function getPlanDefaults(tier: PlanTier): Omit<AccountLimits, 'plan_tier'> {
  return { ...PLAN_DEFAULTS[tier] }
}

export function resolvePlanLimits(account: AccountLimits): AccountLimits {
  return account
}

export async function getAccountLimits(accountId: string): Promise<AccountLimits | null> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('accounts')
    .select(
      'plan_tier, max_users, max_contacts, max_pipelines, max_active_flows, max_broadcasts_per_month, allow_flows, allow_api_access, allow_white_label, allow_store, store_expires_at, max_products, max_orders_per_month, allow_reputation, max_review_requests',
    )
    .eq('id', accountId)
    .maybeSingle()
  if (error || !data) return null
  return {
    plan_tier: data.plan_tier as PlanTier,
    max_users: data.max_users,
    max_contacts: data.max_contacts,
    max_pipelines: data.max_pipelines,
    max_active_flows: data.max_active_flows,
    max_broadcasts_per_month: data.max_broadcasts_per_month,
    allow_flows: data.allow_flows,
    allow_api_access: data.allow_api_access,
    allow_white_label: data.allow_white_label,
    allow_store: data.allow_store,
    allow_reputation: data.allow_reputation,
    store_expires_at: data.store_expires_at,
    max_products: data.max_products,
    max_orders_per_month: data.max_orders_per_month,
    max_review_requests: data.max_review_requests,
  }
}

function columnFor(type: LimitType): string {
  switch (type) {
    case 'users': return 'profiles'
    case 'contacts': return 'contacts'
    case 'pipelines': return 'pipelines'
    case 'active_flows': return 'flows'
    case 'broadcasts_per_month': return 'broadcasts'
    case 'products': return 'products'
    case 'orders_per_month': return 'orders'
    case 'review_requests_per_month': return 'review_requests'
  }
}

export async function checkPlanLimit(
  accountId: string,
  type: LimitType,
): Promise<LimitCheckResult> {
  const limits = await getAccountLimits(accountId)
  if (!limits) {
    return { allowed: false, current: 0, limit: 0, message: 'Account not found' }
  }

  const limitKey = {
    users: 'max_users',
    contacts: 'max_contacts',
    pipelines: 'max_pipelines',
    active_flows: 'max_active_flows',
    broadcasts_per_month: 'max_broadcasts_per_month',
    products: 'max_products',
    orders_per_month: 'max_orders_per_month',
    review_requests_per_month: 'max_review_requests',
  } as const satisfies Record<LimitType, keyof AccountLimits>

  const maxLimit = limits[limitKey[type]] as number
  const admin = supabaseAdmin()

  let current = 0

  switch (type) {
    case 'users': {
      const { count } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
      current = count ?? 0
      break
    }
    case 'contacts': {
      const { count } = await admin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
      current = count ?? 0
      break
    }
    case 'pipelines': {
      const { count } = await admin
        .from('pipelines')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
      current = count ?? 0
      break
    }
    case 'active_flows': {
      const { count } = await admin
        .from('flows')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('status', 'active')
      current = count ?? 0
      break
    }
    case 'broadcasts_per_month': {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count } = await admin
        .from('broadcasts')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .gte('created_at', firstOfMonth)
      current = count ?? 0
      break
    }
    case 'products': {
      const { count } = await admin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
      current = count ?? 0
      break
    }
    case 'orders_per_month': {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count } = await admin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .gte('created_at', firstOfMonth)
      current = count ?? 0
      break
    }
    case 'review_requests_per_month': {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count } = await admin
        .from('review_requests')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .gte('created_at', firstOfMonth)
      current = count ?? 0
      break
    }
  }

  const allowed = current < maxLimit
  return {
    allowed,
    current,
    limit: maxLimit,
    message: allowed
      ? undefined
      : `You have reached the ${type.replace(/_/g, ' ')} limit (${current}/${maxLimit}). Please upgrade your plan to add more.`,
  }
}

export async function checkFeatureGate(
  accountId: string,
  feature: FeatureGate,
): Promise<boolean> {
  const limits = await getAccountLimits(accountId)
  if (!limits) return false

  const gateKey = {
    flows: 'allow_flows',
    api_access: 'allow_api_access',
    white_label: 'allow_white_label',
    store: 'allow_store',
    reputation: 'allow_reputation',
  } as const satisfies Record<FeatureGate, keyof AccountLimits>

  if (feature === 'store') {
    // Check if store is enabled and not expired
    if (!limits.allow_store) return false
    if (limits.store_expires_at) {
      const expiry = new Date(limits.store_expires_at)
      if (expiry < new Date()) return false
    }
    return true
  }

  return limits[gateKey[feature]] as boolean
}

export async function checkStorefrontAccess(accountId: string): Promise<boolean> {
  return checkFeatureGate(accountId, 'store')
}

