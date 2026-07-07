-- ============================================================
-- 027_super_admin_and_gates.sql — Super admin flag + plan limits
--
-- Adds:
--   1. `is_super_admin` boolean on profiles (opt-in, default false).
--   2. Plan/limit columns on accounts for subscription gating.
--   3. A helper function `is_super_admin()` for quick checks.
--   4. A default-plan function used at account creation.
--
-- The super admin flag is NOT set via the app — an operator marks
-- the primary admin manually in the Supabase SQL editor:
--
--   UPDATE profiles SET is_super_admin = true WHERE user_id = '<uuid>';
--
-- Design notes:
--   - `is_super_admin` lives on profiles (not a separate table)
--     because it's a rare, singleton-scoped flag and keeping it
--     on the already-loaded profile row avoids an extra query.
--   - Plan limits are stored as simple columns rather than a
--     separate `plans` table so overrides (custom seats, etc.)
--     are just UPDATEs — no join, no pivot, no RLS complexity.
--   - When a plan_tier column is set, the application layer
--     applies the tier's defaults. The DB only stores the values;
--     it does not enforce them (enforcement is in the app layer
--     so over-quota data is never deleted).
--
-- Idempotent — safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. Super admin flag on profiles
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Fast lookup for the middleware / layout guard. Even though the
-- flag is on a tiny set of rows, an index is cheap and makes the
-- server-component guard O(log n) instead of a seq scan.
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin
  ON profiles(is_super_admin)
  WHERE is_super_admin = true;

-- ============================================================
-- 2. Plan/limit columns on accounts
-- ============================================================
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS plan_tier              TEXT    NOT NULL DEFAULT 'starter'
    CHECK (plan_tier IN ('starter', 'growth', 'professional', 'enterprise')),
  ADD COLUMN IF NOT EXISTS max_users              INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_contacts           INTEGER NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS max_pipelines          INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS max_active_flows       INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_broadcasts_per_month INTEGER NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS allow_flows            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_api_access       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_white_label      BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 3. Helper: is_super_admin()
--
-- Returns true iff the calling auth.uid() has the super admin
-- flag set. SECURITY DEFINER so middleware / layouts can call it
-- without any special permissions.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE user_id = auth.uid()),
    false
  );
$$;

ALTER FUNCTION public.is_super_admin() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

-- ============================================================
-- 4. Update signup trigger to set default plan limits
--
-- New accounts get `starter` defaults. The signup trigger already
-- creates accounts via handle_new_user(); we add the explicit
-- default plan columns after the INSERT.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  INSERT INTO public.accounts (
    name, owner_user_id,
    plan_tier, max_users, max_contacts, max_pipelines,
    max_active_flows, max_broadcasts_per_month,
    allow_flows, allow_api_access, allow_white_label
  ) VALUES (
    COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'),
    NEW.id,
    'starter', 5, 1000, 3, 1, 1000, false, false, false
  )
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, full_name, email, account_id, account_role)
  VALUES (NEW.id, v_full_name, NEW.email, v_account_id, 'owner');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- 5. DB-level enforcement triggers
--
-- These triggers block INSERTs that would exceed plan limits.
-- They fire BEFORE INSERT so the app receives a clear error
-- rather than silently accepting data that exceeds the plan.
--
-- `check_contact_limit` is the primary enforcement point for
-- contacts, since creation happens client-side via direct
-- Supabase inserts (contact-form.tsx, import-modal.tsx).
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_contact_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max INTEGER;
  v_current INTEGER;
BEGIN
  SELECT max_contacts INTO v_max FROM accounts WHERE id = NEW.account_id;
  IF v_max IS NULL THEN
    RAISE EXCEPTION 'Account not found' USING ERRCODE = '22023';
  END IF;
  SELECT COUNT(*) INTO v_current FROM contacts WHERE account_id = NEW.account_id;
  IF v_current >= v_max THEN
    RAISE EXCEPTION 'Contact limit reached (%) for this account. Please upgrade your plan to add more.', v_max
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.check_contact_limit() OWNER TO postgres;

DROP TRIGGER IF EXISTS check_contact_limit_before_insert ON contacts;
CREATE TRIGGER check_contact_limit_before_insert
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_contact_limit();
