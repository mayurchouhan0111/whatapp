-- ============================================================
-- 031_enterprise_saas_architecture.sql — Enterprise Engines
--
-- This migration scaffolds the 17-Engine Enterprise Architecture.
-- It namespaces all platform tables with `saas_` to avoid conflicts
-- with domain tables (e.g., `products`, `orders` from the store).
--
-- Key changes:
--   1. Decouples Identity from Workspace by dropping NOT NULL on profiles.account_id.
--   2. Rewrites handle_new_user() so workspaces are only provisioned post-payment.
--   3. Creates the Product -> Module -> Feature -> Permission hierarchy tables.
--   4. Creates the Subscription, Billing, and Limits engines.
--   5. Creates the Custom Roles engine.
--   6. Introduces the master `has_permission()` RLS helper function.
--
-- Idempotent — safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. IDENTITY ENGINE (Decouple User from Workspace)
-- ============================================================
-- A user can now sign up and exist without a workspace (account)
-- until they purchase a subscription plan and are provisioned one.
ALTER TABLE profiles ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN account_role DROP NOT NULL;

-- Rewrite the signup trigger to ONLY create the profile, not the account.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- We no longer automatically INSERT INTO accounts.
  -- The workspace is provisioned via the Billing Engine (Stripe webhook)
  -- or via accepting an invitation.
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, v_full_name, NEW.email);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. HIERARCHY ENGINE (Products, Modules, Features, Permissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS saas_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- e.g., 'wacrm', 'wastore'
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE, -- e.g., 'crm_sales', 'marketing'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES saas_modules(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE, -- e.g., 'ai_lead_scoring'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES saas_modules(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE, -- e.g., 'contacts.view', 'contacts.delete'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- What products/modules/features an account has enabled
CREATE TABLE IF NOT EXISTS saas_account_products (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (account_id, product_id)
);

CREATE TABLE IF NOT EXISTS saas_account_modules (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES saas_modules(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (account_id, module_id)
);

CREATE TABLE IF NOT EXISTS saas_account_features (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES saas_features(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (account_id, feature_id)
);

-- ============================================================
-- 3. SUBSCRIPTION & BILLING ENGINE
-- ============================================================
CREATE TABLE IF NOT EXISTS saas_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly', 'lifetime')),
  price NUMERIC(10, 2) NOT NULL,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Map plans to products/modules
CREATE TABLE IF NOT EXISTS saas_plan_products (
  plan_id UUID NOT NULL REFERENCES saas_plans(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES saas_products(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, product_id)
);

CREATE TABLE IF NOT EXISTS saas_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES saas_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES saas_subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  due_date TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES saas_invoices(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. ROLE & PERMISSION ENGINE
-- ============================================================
CREATE TABLE IF NOT EXISTS saas_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE, -- NULL for system roles
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_role_permissions (
  role_id UUID NOT NULL REFERENCES saas_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES saas_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS saas_user_permission_overrides (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES saas_permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL, -- True to grant, False to explicitly revoke
  PRIMARY KEY (account_id, user_id, permission_id)
);

-- Replaces profiles.account_role to support custom roles per account
CREATE TABLE IF NOT EXISTS saas_account_member_roles (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES saas_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, user_id, role_id)
);

-- ============================================================
-- 5. LIMITS ENGINE
-- ============================================================
CREATE TABLE IF NOT EXISTS saas_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- 'contacts', 'users', 'broadcasts'
  name TEXT NOT NULL,
  unit TEXT NOT NULL -- 'count', 'gb', 'credits'
);

CREATE TABLE IF NOT EXISTS saas_plan_limits (
  plan_id UUID NOT NULL REFERENCES saas_plans(id) ON DELETE CASCADE,
  limit_id UUID NOT NULL REFERENCES saas_limits(id) ON DELETE CASCADE,
  max_value INTEGER NOT NULL,
  PRIMARY KEY (plan_id, limit_id)
);

CREATE TABLE IF NOT EXISTS saas_account_limit_usage (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  limit_id UUID NOT NULL REFERENCES saas_limits(id) ON DELETE CASCADE,
  used INTEGER NOT NULL DEFAULT 0,
  remaining INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, limit_id)
);

-- ============================================================
-- 6. AUDIT & INTEGRATION ENGINES
-- ============================================================
CREATE TABLE IF NOT EXISTS saas_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saas_account_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'shopify', 'zapier'
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('active', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. MASTER RLS HELPER FUNCTION
-- ============================================================
-- This function calculates Effective Permissions on the fly.
-- It is intentionally highly optimized for use inside RLS policies.
CREATE OR REPLACE FUNCTION public.has_permission(
  p_account_id UUID,
  p_permission_key TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH perm AS (
    SELECT id, module_id FROM saas_permissions WHERE key = p_permission_key LIMIT 1
  ),
  sub AS (
    SELECT status FROM saas_subscriptions WHERE account_id = p_account_id LIMIT 1
  ),
  override AS (
    SELECT is_granted 
    FROM saas_user_permission_overrides 
    WHERE account_id = p_account_id 
      AND user_id = auth.uid() 
      AND permission_id = (SELECT id FROM perm)
    LIMIT 1
  )
  SELECT 
    -- 1. Must be authenticated
    auth.uid() IS NOT NULL
    -- 2. Subscription must be active (or we are an owner and the system ignores sub for billing access, but generally enforced)
    AND COALESCE((SELECT status FROM sub), 'trialing') IN ('active', 'trialing')
    -- 3. Module must be active for the account
    AND EXISTS (
      SELECT 1 FROM saas_account_modules sam 
      WHERE sam.account_id = p_account_id 
        AND sam.module_id = (SELECT module_id FROM perm)
        AND sam.is_active = true
    )
    -- 4. Compute Effective Permission (Override wins, else Role mapping)
    AND (
      -- If there is an override, use its boolean value
      (SELECT is_granted FROM override) IS NOT NULL AND (SELECT is_granted FROM override) = true
      OR
      -- If no override, check if their role has the permission mapped
      ((SELECT is_granted FROM override) IS NULL AND EXISTS (
        SELECT 1 
        FROM saas_account_member_roles mr
        JOIN saas_role_permissions rp ON rp.role_id = mr.role_id
        WHERE mr.account_id = p_account_id
          AND mr.user_id = auth.uid()
          AND rp.permission_id = (SELECT id FROM perm)
      ))
    );
$$;

ALTER FUNCTION public.has_permission(UUID, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated, service_role;
