'use client'

import { useState, useCallback } from 'react'
import { getPlanDefaults, type PlanTier } from '@/lib/billing/limits'
import { ShieldAlert, Cpu, Palette, Check, ArrowLeft, Users, Contact, GitBranch, Radio, Send, Store, Package, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import type { AccountDetail, SaasModule } from './page'

const PLAN_TIERS: PlanTier[] = ['free', 'starter', 'growth', 'pro', 'enterprise']

const MODULE_KEYS_PER_TIER: Record<PlanTier, string[]> = {
  free: ['reputation'],
  starter: ['crm', 'inbox', 'marketing', 'automation', 'reputation'],
  growth: ['crm', 'inbox', 'marketing', 'automation', 'reputation'],
  pro: ['crm', 'inbox', 'marketing', 'automation', 'store', 'reputation'],
  enterprise: ['crm', 'inbox', 'marketing', 'automation', 'store', 'reputation'],
}

const LIMIT_CONFIG = [
  { key: 'max_contacts', label: 'Contacts', icon: Contact, usageKey: 'used_contacts' as const },
  { key: 'max_users', label: 'Team Users', icon: Users, usageKey: null },
  { key: 'max_pipelines', label: 'Pipelines', icon: GitBranch, usageKey: null },
  { key: 'max_active_flows', label: 'Active Flows', icon: Radio, usageKey: null },
  { key: 'max_broadcasts_per_month', label: 'Monthly Broadcasts', icon: Send, usageKey: null },
]

const STORE_LIMITS = [
  { key: 'max_products', label: 'Max Products', icon: Package },
  { key: 'max_orders_per_month', label: 'Orders / Month', icon: BarChart3 },
]

export function AccountForm({
  account,
  allModules,
  updateAccount,
  updated,
}: {
  account: AccountDetail
  allModules: SaasModule[]
  updateAccount: (formData: FormData) => Promise<void>
  updated: boolean
}) {
  const [planTier, setPlanTier] = useState<PlanTier>(account.plan_tier)
  const defaults = getPlanDefaults(planTier)

  const defaultModuleKeys = MODULE_KEYS_PER_TIER[planTier]

  const moduleIsActive = useCallback(
    (mod: SaasModule) => {
      const activeIds = new Set(account.active_module_ids)
      if (planTier === account.plan_tier) return activeIds.has(mod.id)
      return defaultModuleKeys.includes(mod.key)
    },
    [planTier, account.plan_tier, account.active_module_ids, defaultModuleKeys]
  )

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlanTier(e.target.value as PlanTier)
  }

  const currentVal = (key: string): number => {
    const accountRecord = account as unknown as Record<string, number>
    const defaultsRecord = defaults as unknown as Record<string, number>
    if (planTier === account.plan_tier) return accountRecord[key] ?? defaultsRecord[key] ?? 0
    return defaultsRecord[key] ?? 0
  }

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/accounts"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{account.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Managed by <span className="font-medium text-foreground">{account.owner_email}</span>
            <span className="mx-1.5">&middot;</span>
            Created {new Date(account.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {updated && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-200">Account settings updated successfully.</p>
        </div>
      )}

      <form action={updateAccount} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <input type="hidden" name="account_id" value={account.id} />
        <input type="hidden" name="all_module_ids" value={allModules.map((m) => m.id).join(',')} />

        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Feature Permissions</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-5">
                Modules auto-select based on plan tier. Toggle individually to override.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allModules.map((mod) => {
                  const checked = moduleIsActive(mod)
                  return (
                    <label
                      key={mod.id}
                      className="relative flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 hover:bg-muted/30 hover:border-primary/40 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary"
                    >
                      <input
                        type="checkbox"
                        name={`module_${mod.id}`}
                        defaultChecked={checked}
                        className="sr-only"
                      />
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{mod.name}</span>
                          {checked && <Check className="h-4 w-4 shrink-0 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{mod.description || 'Module'}</p>
                      </div>
                    </label>
                  )
                })}

                <label className="relative flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 hover:bg-muted/30 hover:border-primary/40 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                  <input
                    type="checkbox"
                    name="allow_api_access"
                    defaultChecked={planTier === account.plan_tier ? account.allow_api_access : defaults.allow_api_access}
                    className="sr-only"
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">API Access</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">Enables programmatic access</p>
                  </div>
                </label>

                <label className="relative flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 hover:bg-muted/30 hover:border-primary/40 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                  <input
                    type="checkbox"
                    name="allow_white_label"
                    defaultChecked={planTier === account.plan_tier ? account.allow_white_label : defaults.allow_white_label}
                    className="sr-only"
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                    <Palette className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">White-label</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">Removes Vbuild branding</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">Usage Limits & Quotas</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex-1">
                  <label htmlFor="plan_tier" className="block text-sm font-medium text-foreground mb-1.5">
                    Base Plan Tier
                  </label>
                  <select
                    id="plan_tier"
                    name="plan_tier"
                    value={planTier}
                    onChange={handlePlanChange}
                    className="flex h-10 w-full sm:w-56 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {PLAN_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fields auto-fill to {planTier.charAt(0).toUpperCase() + planTier.slice(1)} defaults. Override below.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {LIMIT_CONFIG.map(({ key, label, icon: Icon, usageKey }) => {
                  const val = currentVal(key)
                  const defaultsRecord = defaults as unknown as Record<string, number>
                  const accountRecord = account as unknown as Record<string, number>
                  const defaultVal = defaultsRecord[key] ?? 0
                  const usage = usageKey ? accountRecord[usageKey] ?? 0 : null

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor={key} className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {label}
                        </label>
                        {usage !== null && (
                          <span className="text-xs text-muted-foreground">{usage.toLocaleString()} used</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          id={key}
                          name={key}
                          type="number"
                          min={1}
                          defaultValue={val}
                          key={`${planTier}-${key}`}
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                          Default: {typeof defaultVal === 'number' ? defaultVal.toLocaleString() : defaultVal}
                        </span>
                      </div>
                      {usage !== null && val > 0 && (
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usage / val > 0.8 ? 'bg-rose-500' : usage / val > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.round((usage / val) * 100))}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <hr className="my-6 border-border" />

              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                Storefront Limits
              </h4>

              <div className="grid gap-5 sm:grid-cols-2">
                {STORE_LIMITS.map(({ key, label, icon: Icon }) => {
                  const val = currentVal(key)
                  const defaultsRecord = defaults as unknown as Record<string, number>
                  const defaultVal = defaultsRecord[key] ?? 0
                  return (
                    <div key={key} className="space-y-2">
                      <label htmlFor={key} className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {label}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id={key}
                          name={key}
                          type="number"
                          min={0}
                          defaultValue={val}
                          key={`${planTier}-${key}`}
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                          Default: {typeof defaultVal === 'number' ? defaultVal.toLocaleString() : defaultVal}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 flex justify-end gap-3 pb-8">
          <Link
            href="/admin/accounts"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            Save Account Settings
          </button>
        </div>
      </form>
    </div>
  )
}
