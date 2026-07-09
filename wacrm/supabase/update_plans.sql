-- Update existing plans to match marketing page pricing
-- Run this in Supabase SQL editor if the migration has already been applied.

-- Delete old plan-product mappings and plans, then re-insert
DELETE FROM saas_plan_limits WHERE plan_id IN (SELECT id FROM saas_plans WHERE name IN ('Starter', 'Growth', 'Enterprise'));
DELETE FROM saas_plan_products WHERE plan_id IN (SELECT id FROM saas_plans WHERE name IN ('Starter', 'Growth', 'Enterprise'));
DELETE FROM saas_subscriptions WHERE plan_id IN (SELECT id FROM saas_plans WHERE name IN ('Starter', 'Growth', 'Enterprise'));
DELETE FROM saas_plans WHERE name IN ('Starter', 'Growth', 'Enterprise');

-- Re-insert with correct names and prices
DO $$
DECLARE
  v_prod_wacrm UUID;
  v_prod_wastore UUID;
  v_limit_contacts UUID;
  v_limit_users UUID;
  v_limit_broadcasts UUID;
  v_plan_free UUID;
  v_plan_starter UUID;
  v_plan_pro UUID;
BEGIN
  SELECT id INTO v_prod_wacrm FROM saas_products WHERE key = 'wacrm';
  SELECT id INTO v_prod_wastore FROM saas_products WHERE key = 'wastore';
  SELECT id INTO v_limit_contacts FROM saas_limits WHERE key = 'contacts';
  SELECT id INTO v_limit_users FROM saas_limits WHERE key = 'users';
  SELECT id INTO v_limit_broadcasts FROM saas_limits WHERE key = 'broadcasts_per_month';

  -- Free
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Free', 'monthly', 0) RETURNING id INTO v_plan_free;
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_free, v_limit_contacts, 500),
    (v_plan_free, v_limit_users, 1),
    (v_plan_free, v_limit_broadcasts, 100);

  -- Starter
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Starter', 'monthly', 999.00) RETURNING id INTO v_plan_starter;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_starter, v_prod_wacrm);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_starter, v_limit_contacts, 5000),
    (v_plan_starter, v_limit_users, 3),
    (v_plan_starter, v_limit_broadcasts, 1000);

  -- Pro
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Pro', 'monthly', 2999.00) RETURNING id INTO v_plan_pro;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_pro, v_prod_wacrm), (v_plan_pro, v_prod_wastore);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_pro, v_limit_contacts, 50000),
    (v_plan_pro, v_limit_users, 10),
    (v_plan_pro, v_limit_broadcasts, 10000);
END $$;
