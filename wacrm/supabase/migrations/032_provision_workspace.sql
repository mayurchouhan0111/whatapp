-- ============================================================
-- 032_provision_workspace.sql
--
-- Provisions a complete workspace/account after a successful
-- subscription payment. This replaces the old auto-provisioning
-- that happened during user signup.
--
-- This function is called by the billing backend (e.g. Stripe webhook)
-- using the service_role key.
-- ============================================================

CREATE OR REPLACE FUNCTION public.provision_workspace(
  p_user_id UUID,
  p_plan_id UUID,
  p_account_name TEXT,
  p_stripe_subscription_id TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_role_id UUID;
  v_product_id UUID;
  v_module_id UUID;
BEGIN
  -- 1. Create or Get the Account (Workspace)
  SELECT id INTO v_account_id FROM public.accounts WHERE owner_user_id = p_user_id LIMIT 1;
  
  IF v_account_id IS NULL THEN
    INSERT INTO public.accounts (name, owner_user_id)
    VALUES (p_account_name, p_user_id)
    RETURNING id INTO v_account_id;
  END IF;

  -- 2. Create or Update the Active Subscription
  INSERT INTO public.saas_subscriptions (
    account_id, plan_id, status, current_period_start, current_period_end, stripe_subscription_id
  )
  VALUES (
    v_account_id, p_plan_id, 'active', now(), now() + interval '1 month', p_stripe_subscription_id
  )
  ON CONFLICT (account_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    updated_at = now();

  -- 3. Link the User Profile to this Account and set legacy role
  UPDATE public.profiles
  SET account_id = v_account_id,
      account_role = 'owner'
  WHERE user_id = p_user_id;

  -- 4. Create the System 'Owner' Role for this Workspace
  SELECT id INTO v_role_id FROM public.saas_roles WHERE account_id = v_account_id AND name = 'Owner' LIMIT 1;
  IF v_role_id IS NULL THEN
    INSERT INTO public.saas_roles (account_id, name, description, is_system)
    VALUES (v_account_id, 'Owner', 'Full administrative access', true)
    RETURNING id INTO v_role_id;
  END IF;

  -- 5. Assign the User to the Owner Role
  INSERT INTO public.saas_account_member_roles (account_id, user_id, role_id)
  VALUES (v_account_id, p_user_id, v_role_id)
  ON CONFLICT DO NOTHING;

  -- 6. Grant Products and Modules based on the Plan
  FOR v_product_id IN SELECT product_id FROM saas_plan_products WHERE plan_id = p_plan_id LOOP
    -- Grant Product
    INSERT INTO saas_account_products (account_id, product_id, is_active)
    VALUES (v_account_id, v_product_id, true)
    ON CONFLICT (account_id, product_id) DO UPDATE SET is_active = true;

    -- Grant all Modules for this Product
    FOR v_module_id IN SELECT id FROM saas_modules WHERE product_id = v_product_id LOOP
      INSERT INTO saas_account_modules (account_id, module_id, is_active)
      VALUES (v_account_id, v_module_id, true)
      ON CONFLICT (account_id, module_id) DO UPDATE SET is_active = true;
    END LOOP;
  END LOOP;

  -- 6.5. Grant all permissions for activated modules to the Owner role
  INSERT INTO public.saas_role_permissions (role_id, permission_id)
  SELECT v_role_id, p.id
  FROM saas_permissions p
  JOIN saas_account_modules am ON am.module_id = p.module_id
  WHERE am.account_id = v_account_id
  ON CONFLICT DO NOTHING;

  -- 7. Initialize Limits based on Plan Limits
  INSERT INTO saas_account_limit_usage (account_id, limit_id, used, remaining)
  SELECT 
    v_account_id, 
    limit_id, 
    0, 
    max_value
  FROM saas_plan_limits
  WHERE plan_id = p_plan_id
  ON CONFLICT (account_id, limit_id) DO UPDATE SET remaining = EXCLUDED.remaining;

  RETURN v_account_id;
END;
$$;

ALTER FUNCTION public.provision_workspace(UUID, UUID, TEXT, TEXT) OWNER TO postgres;
