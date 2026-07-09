-- Update all plans to match unified pricing (Free / Starter / Growth / Pro / Enterprise)
-- Run this in Supabase SQL editor after migrations have been applied.

-- Wipe old plans and re-insert
DELETE FROM saas_plan_limits WHERE plan_id IN (SELECT id FROM saas_plans);
DELETE FROM saas_plan_products WHERE plan_id IN (SELECT id FROM saas_plans);
DELETE FROM saas_subscriptions WHERE plan_id IN (SELECT id FROM saas_plans);
DELETE FROM saas_plans;

DO $$
DECLARE
  v_prod_wacrm UUID;
  v_prod_wastore UUID;
  v_limit_contacts UUID;
  v_limit_users UUID;
  v_limit_broadcasts UUID;
  v_limit_pipelines UUID;
  v_limit_flows UUID;
  v_limit_products UUID;
  v_limit_orders UUID;
  v_plan_free UUID;
  v_plan_starter UUID;
  v_plan_growth UUID;
  v_plan_pro UUID;
BEGIN
  SELECT id INTO v_prod_wacrm FROM saas_products WHERE key = 'wacrm';
  SELECT id INTO v_prod_wastore FROM saas_products WHERE key = 'wastore';

  -- Upsert limits (add missing ones if not exist)
  INSERT INTO saas_limits (key, name, unit) VALUES ('contacts', 'Total Contacts', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_contacts;
  INSERT INTO saas_limits (key, name, unit) VALUES ('users', 'Team Members', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_users;
  INSERT INTO saas_limits (key, name, unit) VALUES ('broadcasts_per_month', 'Monthly Broadcasts', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_broadcasts;
  INSERT INTO saas_limits (key, name, unit) VALUES ('pipelines', 'Sales Pipelines', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_pipelines;
  INSERT INTO saas_limits (key, name, unit) VALUES ('active_flows', 'Active Flows', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_flows;
  INSERT INTO saas_limits (key, name, unit) VALUES ('products', 'Store Products', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_products;
  INSERT INTO saas_limits (key, name, unit) VALUES ('orders_per_month', 'Monthly Orders', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_orders;

  -- ==============================
  -- Free — ₹0/mo
  -- ==============================
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Free', 'monthly', 0) RETURNING id INTO v_plan_free;
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_free, v_limit_contacts, 500),
    (v_plan_free, v_limit_users, 1),
    (v_plan_free, v_limit_broadcasts, 100),
    (v_plan_free, v_limit_pipelines, 1),
    (v_plan_free, v_limit_flows, 0),
    (v_plan_free, v_limit_products, 0),
    (v_plan_free, v_limit_orders, 0);

  -- ==============================
  -- Starter — ₹999/mo
  -- ==============================
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Starter', 'monthly', 999.00) RETURNING id INTO v_plan_starter;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_starter, v_prod_wacrm);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_starter, v_limit_contacts, 2500),
    (v_plan_starter, v_limit_users, 3),
    (v_plan_starter, v_limit_broadcasts, 1000),
    (v_plan_starter, v_limit_pipelines, 2),
    (v_plan_starter, v_limit_flows, 1),
    (v_plan_starter, v_limit_products, 50),
    (v_plan_starter, v_limit_orders, 100);

  -- ==============================
  -- Growth — ₹1,999/mo (Most Popular)
  -- ==============================
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Growth', 'monthly', 1999.00) RETURNING id INTO v_plan_growth;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_growth, v_prod_wacrm), (v_plan_growth, v_prod_wastore);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_growth, v_limit_contacts, 15000),
    (v_plan_growth, v_limit_users, 10),
    (v_plan_growth, v_limit_broadcasts, 10000),
    (v_plan_growth, v_limit_pipelines, 5),
    (v_plan_growth, v_limit_flows, 10),
    (v_plan_growth, v_limit_products, 500),
    (v_plan_growth, v_limit_orders, 1000);

  -- ==============================
  -- Pro — ₹3,999/mo
  -- ==============================
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Pro', 'monthly', 3999.00) RETURNING id INTO v_plan_pro;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_pro, v_prod_wacrm), (v_plan_pro, v_prod_wastore);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES
    (v_plan_pro, v_limit_contacts, 50000),
    (v_plan_pro, v_limit_users, 25),
    (v_plan_pro, v_limit_broadcasts, 50000),
    (v_plan_pro, v_limit_pipelines, 999),
    (v_plan_pro, v_limit_flows, 999),
    (v_plan_pro, v_limit_products, 2500),
    (v_plan_pro, v_limit_orders, 5000);

  -- ==============================
  -- Note: Enterprise (Custom) not inserted as it's handled via sales.
  -- Accounts with plan_tier = 'enterprise' get code-level defaults from limits.ts.
  -- ==============================
END $$;
