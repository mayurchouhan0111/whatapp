import { describe, it, expect } from 'vitest'
import { getPlanDefaults, type PlanTier } from './limits'

describe('getPlanDefaults', () => {
  it('returns free defaults', () => {
    const limits = getPlanDefaults('free')
    expect(limits.max_users).toBe(1)
    expect(limits.max_contacts).toBe(500)
    expect(limits.max_pipelines).toBe(1)
    expect(limits.max_active_flows).toBe(0)
    expect(limits.max_broadcasts_per_month).toBe(100)
    expect(limits.allow_flows).toBe(false)
    expect(limits.allow_api_access).toBe(false)
    expect(limits.allow_white_label).toBe(false)
    expect(limits.allow_store).toBe(false)
  })

  it('returns starter defaults', () => {
    const limits = getPlanDefaults('starter')
    expect(limits.max_users).toBe(3)
    expect(limits.max_contacts).toBe(2500)
    expect(limits.max_pipelines).toBe(2)
    expect(limits.max_active_flows).toBe(1)
    expect(limits.max_broadcasts_per_month).toBe(1000)
    expect(limits.allow_flows).toBe(true)
    expect(limits.allow_api_access).toBe(false)
    expect(limits.allow_white_label).toBe(false)
    expect(limits.allow_store).toBe(true)
    expect(limits.max_products).toBe(50)
    expect(limits.max_orders_per_month).toBe(100)
  })

  it('returns growth defaults', () => {
    const limits = getPlanDefaults('growth')
    expect(limits.max_users).toBe(10)
    expect(limits.max_contacts).toBe(15_000)
    expect(limits.max_pipelines).toBe(5)
    expect(limits.max_active_flows).toBe(10)
    expect(limits.max_broadcasts_per_month).toBe(10_000)
    expect(limits.allow_flows).toBe(true)
    expect(limits.allow_api_access).toBe(true)
    expect(limits.allow_white_label).toBe(false)
    expect(limits.allow_store).toBe(true)
    expect(limits.max_products).toBe(500)
    expect(limits.max_orders_per_month).toBe(1000)
  })

  it('returns pro defaults', () => {
    const limits = getPlanDefaults('pro')
    expect(limits.max_users).toBe(25)
    expect(limits.max_contacts).toBe(50_000)
    expect(limits.max_pipelines).toBe(999)
    expect(limits.max_active_flows).toBe(999)
    expect(limits.max_broadcasts_per_month).toBe(50_000)
    expect(limits.allow_flows).toBe(true)
    expect(limits.allow_api_access).toBe(true)
    expect(limits.allow_white_label).toBe(false)
    expect(limits.allow_store).toBe(true)
    expect(limits.max_products).toBe(2500)
    expect(limits.max_orders_per_month).toBe(5000)
  })

  it('returns enterprise defaults', () => {
    const limits = getPlanDefaults('enterprise')
    expect(limits.max_users).toBe(9_999)
    expect(limits.max_contacts).toBe(999_999)
    expect(limits.max_pipelines).toBe(999)
    expect(limits.max_active_flows).toBe(999)
    expect(limits.max_broadcasts_per_month).toBe(9_999_999)
    expect(limits.allow_flows).toBe(true)
    expect(limits.allow_api_access).toBe(true)
    expect(limits.allow_white_label).toBe(true)
  })

  it('returns a copy, not a mutable reference', () => {
    const a = getPlanDefaults('starter')
    const b = getPlanDefaults('starter')
    expect(a).toEqual(b)
    // Mutating a should not affect b
    a.max_users = 999
    expect(b.max_users).toBe(3)
  })

  it('every plan tier has valid defaults', () => {
    const tiers: PlanTier[] = ['free', 'starter', 'growth', 'pro', 'enterprise']
    for (const tier of tiers) {
      const limits = getPlanDefaults(tier)
      expect(limits.max_users).toBeGreaterThanOrEqual(0)
      expect(limits.max_contacts).toBeGreaterThanOrEqual(0)
      expect(limits.max_pipelines).toBeGreaterThanOrEqual(0)
      expect(limits.max_broadcasts_per_month).toBeGreaterThanOrEqual(0)
    }
  })
})
