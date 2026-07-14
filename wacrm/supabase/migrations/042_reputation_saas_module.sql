-- ============================================================
-- 042_reputation_saas_module.sql
-- Integrates Reputation / Google Review Feedback into the
-- SaaS module, permission, and subscription system.
-- ============================================================

-- 1) Add `allow_reputation` and `max_review_requests` columns
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS allow_reputation         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_review_requests       INTEGER NOT NULL DEFAULT 0;

-- 2) Seed the SaaS module entry
INSERT INTO saas_modules (module_key, product, name, description, is_active)
VALUES (
  'reputation',
  'wacrm',
  'Reputation & Reviews',
  'Google Review feedback collection, QR check-in, review gating, and reputation analytics.',
  TRUE
)
ON CONFLICT (module_key, product) DO NOTHING;

-- 3) Seed reputation permission keys
INSERT INTO saas_permissions (module_key, permission_key, name, description)
VALUES
  ('reputation', 'reputation.view',   'View Reputation',   'View reputation dashboard, analytics, and review logs.'),
  ('reputation', 'reputation.manage', 'Manage Reputation', 'Configure settings, send review requests, and manage feedback.')
ON CONFLICT (permission_key) DO NOTHING;

-- 4) Seed default role-to-permission mappings
--    owner / admin → view + manage
--    agent         → view only
--    viewer        → no reputation access
INSERT INTO saas_role_permissions (role, permission_key)
SELECT 'owner', p.permission_key
FROM saas_permissions p WHERE p.module_key = 'reputation'
ON CONFLICT DO NOTHING;

INSERT INTO saas_role_permissions (role, permission_key)
SELECT 'admin', p.permission_key
FROM saas_permissions p WHERE p.module_key = 'reputation'
ON CONFLICT DO NOTHING;

INSERT INTO saas_role_permissions (role, permission_key)
SELECT 'agent', p.permission_key
FROM saas_permissions p WHERE p.module_key = 'reputation' AND p.permission_key = 'reputation.view'
ON CONFLICT DO NOTHING;

-- 5) Seed plan defaults for the reputation module
--    Free:     no reputation
--    Starter:  reputation with 50 review requests/month
--    Growth:   reputation with 500 review requests/month
--    Pro:      reputation with 5000 review requests/month
--    Enterprise: reputation with unlimited review requests
INSERT INTO saas_plan_limits (plan_tier, limit_type, limit_value)
VALUES
  ('free',       'review_requests_per_month', 0),
  ('starter',    'review_requests_per_month', 50),
  ('growth',     'review_requests_per_month', 500),
  ('pro',        'review_requests_per_month', 5000),
  ('enterprise', 'review_requests_per_month', 999999)
ON CONFLICT (plan_tier, limit_type) DO UPDATE SET limit_value = EXCLUDED.limit_value;

-- 6) Enable reputation for existing paid accounts via the provisioning function
UPDATE accounts
SET
  allow_reputation = TRUE,
  max_review_requests = 50
WHERE plan_tier IN ('starter', 'growth', 'pro');

UPDATE accounts
SET
  allow_reputation = TRUE,
  max_review_requests = 999999
WHERE plan_tier = 'enterprise';
