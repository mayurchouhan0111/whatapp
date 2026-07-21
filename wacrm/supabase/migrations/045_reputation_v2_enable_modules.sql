-- ============================================================
-- 045_reputation_v2_enable_modules.sql
-- Enables the reputation module for accounts and ensures the
-- saas_account_modules table has entries so has_permission works.
-- ============================================================

-- Enable reputation for free accounts too (not just paid tiers)
UPDATE accounts
SET
  allow_reputation = TRUE,
  max_review_requests = 10
WHERE plan_tier = 'free';

-- Seed saas_account_modules for all accounts with allow_reputation = TRUE
INSERT INTO saas_account_modules (account_id, module_id, is_active)
SELECT
  a.id,
  sm.id,
  TRUE
FROM accounts a
CROSS JOIN saas_modules sm
WHERE a.allow_reputation = TRUE
  AND sm.module_key = 'reputation'
  AND NOT EXISTS (
    SELECT 1 FROM saas_account_modules sam
    WHERE sam.account_id = a.id
      AND sam.module_id = sm.id
  );
