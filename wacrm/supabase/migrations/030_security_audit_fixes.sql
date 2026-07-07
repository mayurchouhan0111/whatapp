-- Migration: 030_security_audit_fixes
-- Description: Fixes for privilege escalation, revenue leakage, and feature gating bypass.

-- 1. Protect Profiles (Privilege Escalation Fix)
CREATE OR REPLACE FUNCTION protect_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent authenticated users from escalating privileges or changing account assignments
  IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
    NEW.is_super_admin := OLD.is_super_admin;
    NEW.account_role := OLD.account_role;
    NEW.account_id := OLD.account_id;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_profile_protection ON profiles;
CREATE TRIGGER enforce_profile_protection
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_profile_updates();


-- 2. Enforce Pipeline Limits (Revenue Leakage Fix)
CREATE OR REPLACE FUNCTION check_pipeline_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_max_pipelines INT;
  v_current_pipelines INT;
BEGIN
  -- Get max pipelines allowed for the account
  SELECT max_pipelines INTO v_max_pipelines
  FROM accounts
  WHERE id = NEW.account_id;

  -- Allow infinite pipelines if max_pipelines is null, otherwise enforce limit
  IF v_max_pipelines IS NOT NULL THEN
    -- Get current number of pipelines for the account
    SELECT count(*) INTO v_current_pipelines
    FROM pipelines
    WHERE account_id = NEW.account_id;

    -- Check if limit is exceeded
    IF v_current_pipelines >= v_max_pipelines THEN
      RAISE EXCEPTION 'Pipeline limit reached for this account';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_pipeline_limit ON pipelines;
CREATE TRIGGER enforce_pipeline_limit
BEFORE INSERT ON pipelines
FOR EACH ROW
EXECUTE FUNCTION check_pipeline_limit();


-- 3. Protect Flow Status (Feature Gating Bypass Fix)
CREATE OR REPLACE FUNCTION protect_flow_status_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent authenticated users from bypassing feature gating via direct status updates
  IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_flow_status_protection ON flows;
CREATE TRIGGER enforce_flow_status_protection
BEFORE UPDATE ON flows
FOR EACH ROW
EXECUTE FUNCTION protect_flow_status_updates();
