'use client'

import { useState, useCallback } from 'react'
import { getPlanDefaults, type PlanTier } from '@/lib/billing/limits'
import { ShieldAlert, Cpu, Palette, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { AccountDetail, SaasModule } from './page'

const PLAN_TIERS: PlanTier[] = ['free', 'starter', 'growth', 'pro', 'enterprise']

const MODULE_KEYS_PER_TIER: Record<PlanTier, string[]> = {
  free: [],
  starter: ['crm', 'inbox', 'marketing', 'automation'],
  growth: ['crm', 'inbox', 'marketing', 'automation'],
  pro: ['crm', 'inbox', 'marketing', 'automation', 'store'],
  enterprise: ['crm', 'inbox', 'marketing', 'automation', 'store'],
}

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

  const activeModuleIds = new Set(account.active_module_ids)
  const defaultModuleKeys = MODULE_KEYS_PER_TIER[planTier]
  const moduleIdByKey = Object.fromEntries(allModules.map((m) => [m.key, m.id]))

  const moduleIsActive = useCallback(
    (mod: SaasModule) => {
      if (planTier === account.plan_tier) return activeModuleIds.has(mod.id)
      return defaultModuleKeys.includes(mod.key)
    },
    [planTier, account.plan_tier, activeModuleIds, defaultModuleKeys]
  )

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlanTier(e.target.value as PlanTier)
  }

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
            Managed by <span className="font-medium text-foreground">{account.owner_email}</span> &middot; Created{' '}
            {new Date(account.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {updated && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-200">
            Account settings and permissions updated successfully.
          </p>
        </div>
      )}

      <form action={updateAccount} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <input type="hidden" name="account_id" value={account.id} />
        <input type="hidden" name="all_module_ids" value={allModules.map((m) => m.id).join(',')} />

        {/* Feature Permissions */}
        <div className="lg:col-span-12">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-primary" />
                Page & Feature Permissions
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Modules auto-select based on the plan tier. You can override below.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {allModules.map((mod) => {
                const checked = moduleIsActive(mod)
                return (
                  <label
                    key={mod.id}
                    className="relative flex cursor-pointer flex-col rounded-xl border border-border bg-background p-6 hover:bg-muted/30 hover:border-primary/50 transition-all [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:ring-1 [&:has(:checked)]:ring-primary"
                  >
                    <input
                      type="checkbox"
                      name={`module_${mod.id}`}
                      defaultChecked={checked}
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

              <label className="relative flex cursor-pointer flex-col rounded-xl border border-border bg-background p-6 hover:bg-muted/30 hover:border-primary/50 transition-all [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 [&:has(:checked)]:ring-1 [&:has(:checked)]:ring-primary">
                <input
                  type="checkbox"
                  name="allow_api_access"
                  defaultChecked={planTier === account.plan_tier ? account.allow_api_access : defaults.allow_api_access}
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
                  defaultChecked={planTier === account.plan_tier ? account.allow_white_label : defaults.allow_white_label}
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
                Changing the tier auto-fills limits. You can override any value below.
              </p>
            </div>

            <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <label htmlFor="plan_tier" className="block text-sm font-semibold text-foreground mb-1">
                  Base Plan Tier
                </label>
                <select
                  id="plan_tier"
                  name="plan_tier"
                  value={planTier}
                  onChange={handlePlanChange}
                  className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {PLAN_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  All fields auto-fill to {planTier.charAt(0).toUpperCase() + planTier.slice(1)} defaults. Adjust individually if needed.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ['max_contacts', 'Max Contacts', account.used_contacts.toLocaleString(), defaults.max_contacts, 1],
                  ['max_users', 'Max Team Users', null, defaults.max_users, 1],
                  ['max_pipelines', 'Max Pipelines', null, defaults.max_pipelines, 1],
                  ['max_active_flows', 'Active Flows Limit', null, defaults.max_active_flows, 0],
                  ['max_broadcasts_per_month', 'Monthly Broadcast Limit', null, defaults.max_broadcasts_per_month, 1],
                ] as const
              ).map(([name, label, usage, defaultVal, min]) => (
                <div key={name} className={`space-y-2 ${name === 'max_broadcasts_per_month' ? 'lg:col-span-2' : ''} ${name === 'max_active_flows' ? '' : ''}`}>
                  <label htmlFor={name} className="text-sm font-semibold text-foreground flex items-center justify-between">
                    {label}
                    {usage && <span className="text-xs font-normal text-muted-foreground">Used: {usage}</span>}
                    <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">
                      Default: {(typeof defaultVal === 'number' ? defaultVal.toLocaleString() : defaultVal)}
                    </span>
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="number"
                    min={min}
                    defaultValue={
                      planTier === account.plan_tier
                        ? (account as any)[name]
                        : defaultVal
                    }
                    key={`${planTier}-${name}`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              ))}
            </div>

            <hr className="my-8 border-border" />

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground">Storefront Limits</h4>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ['max_products', 'Max Products', defaults.max_products ?? 0, 0],
                  ['max_orders_per_month', 'Orders / Month', defaults.max_orders_per_month ?? 0, 0],
                ] as const
              ).map(([name, label, defaultVal, min]) => (
                <div key={name} className="space-y-2">
                  <label htmlFor={name} className="text-sm font-semibold text-foreground flex items-center justify-between">
                    {label}
                    <span className="text-[10px] font-normal px-2 py-0.5 bg-muted rounded text-muted-foreground">
                      Default: {(typeof defaultVal === 'number' ? defaultVal.toLocaleString() : defaultVal)}
                    </span>
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="number"
                    min={min}
                    defaultValue={
                      planTier === account.plan_tier
                        ? (account as any)[name] ?? defaultVal
                        : defaultVal
                    }
                    key={`${planTier}-${name}`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              ))}
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
