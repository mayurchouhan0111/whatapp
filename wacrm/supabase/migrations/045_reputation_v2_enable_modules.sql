-- ============================================================
-- 045_reputation_v2_enable_modules.sql
-- Enables the reputation module for accounts and ensures the
-- saas_account_modules table has entries so has_permission works.
-- ============================================================

-- Ensure columns exist (safe even if 042 was already run)
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS allow_reputation         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_review_requests       INTEGER NOT NULL DEFAULT 0;

-- Enable reputation for free accounts too (not just paid tiers)
UPDATE accounts
SET
  allow_reputation = TRUE,
  max_review_requests = 10
WHERE plan_tier = 'free';

-- Seed the reputation module if not already present
INSERT INTO saas_modules (key, name, product_id)
SELECT 'reputation', 'Reputation & Reviews', sp.id
FROM saas_products sp
WHERE sp.key = 'wacrm'
  AND NOT EXISTS (SELECT 1 FROM saas_modules WHERE key = 'reputation')
LIMIT 1;

-- Seed reputation permissions (with correct column names for saas_permissions)
INSERT INTO saas_permissions (module_id, key, name)
SELECT sm.id, 'reputation.view', 'View Reputation'
FROM saas_modules sm
WHERE sm.key = 'reputation'
  AND NOT EXISTS (SELECT 1 FROM saas_permissions WHERE key = 'reputation.view')
LIMIT 1;

INSERT INTO saas_permissions (module_id, key, name)
SELECT sm.id, 'reputation.manage', 'Manage Reputation'
FROM saas_modules sm
WHERE sm.key = 'reputation'
  AND NOT EXISTS (SELECT 1 FROM saas_permissions WHERE key = 'reputation.manage')
LIMIT 1;

-- Map permissions to system roles
-- Admin gets all reputation permissions
INSERT INTO saas_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas_roles r
CROSS JOIN saas_permissions p
WHERE r.name = 'Admin'
  AND r.is_system = TRUE
  AND p.key IN ('reputation.view', 'reputation.manage')
  AND NOT EXISTS (
    SELECT 1 FROM saas_role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Agent gets reputation.view only
INSERT INTO saas_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas_roles r
CROSS JOIN saas_permissions p
WHERE r.name = 'Agent'
  AND r.is_system = TRUE
  AND p.key = 'reputation.view'
  AND NOT EXISTS (
    SELECT 1 FROM saas_role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Viewer gets reputation.view only
INSERT INTO saas_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM saas_roles r
CROSS JOIN saas_permissions p
WHERE r.name = 'Viewer'
  AND r.is_system = TRUE
  AND p.key = 'reputation.view'
  AND NOT EXISTS (
    SELECT 1 FROM saas_role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Seed saas_account_modules for all accounts with allow_reputation = TRUE
INSERT INTO saas_account_modules (account_id, module_id, is_active)
SELECT
  a.id,
  sm.id,
  TRUE
FROM accounts a
CROSS JOIN saas_modules sm
WHERE a.allow_reputation = TRUE
  AND sm.key = 'reputation'
  AND NOT EXISTS (
    SELECT 1 FROM saas_account_modules sam
    WHERE sam.account_id = a.id
      AND sam.module_id = sm.id
  );
