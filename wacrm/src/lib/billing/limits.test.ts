import { describe, it, expect } from 'vitest'
import { getPlanDefaults, type PlanTier } from './limits'

describe('getPlanDefaults', () => {
  it('returns starter defaults', () => {
    const limits = getPlanDefaults('starter')
    expect(limits.max_users).toBe(5)
    expect(limits.max_contacts).toBe(1000)
    expect(limits.max_pipelines).toBe(3)
    expect(limits.max_active_flows).toBe(1)
    expect(limits.max_broadcasts_per_month).toBe(1000)
    expect(limits.allow_flows).toBe(false)
    expect(limits.allow_api_access).toBe(false)
    expect(limits.allow_white_label).toBe(false)
  })

  it('returns growth defaults', () => {
    const limits = getPlanDefaults('growth')
    expect(limits.max_users).toBe(15)
    expect(limits.max_contacts).toBe(5000)
    expect(limits.max_pipelines).toBe(10)
    expect(limits.max_active_flows).toBe(5)
    expect(limits.max_broadcasts_per_month).toBe(10_000)
    expect(limits.allow_flows).toBe(true)
    expect(limits.allow_api_access).toBe(true)
    expect(limits.allow_white_label).toBe(false)
  })

  it('returns professional defaults', () => {
    const limits = getPlanDefaults('professional')
    expect(limits.max_users).toBe(50)
    expect(limits.max_contacts).toBe(25_000)
    expect(limits.max_pipelines).toBe(50)
    expect(limits.max_active_flows).toBe(20)
    expect(limits.max_broadcasts_per_month).toBe(100_000)
    expect(limits.allow_flows).toBe(true)
    expect(limits.allow_api_access).toBe(true)
    expect(limits.allow_white_label).toBe(false)
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
    expect(b.max_users).toBe(5)
  })

  it('every plan tier has valid defaults', () => {
    const tiers: PlanTier[] = ['starter', 'growth', 'professional', 'enterprise']
    for (const tier of tiers) {
      const limits = getPlanDefaults(tier)
      expect(limits.max_users).toBeGreaterThan(0)
      expect(limits.max_contacts).toBeGreaterThan(0)
      expect(limits.max_pipelines).toBeGreaterThan(0)
      expect(limits.max_broadcasts_per_month).toBeGreaterThan(0)
    }
  })
})
