-- ============================================================
-- 033_saas_seed.sql
--
-- Seeds the initial WACRM product, modules, features, permissions,
-- and plans into the new Enterprise Architecture tables.
-- ============================================================

DO $$
DECLARE
  v_prod_wacrm UUID;
  v_prod_wastore UUID;
  
  v_mod_crm UUID;
  v_mod_inbox UUID;
  v_mod_marketing UUID;
  v_mod_automation UUID;
  v_mod_store UUID;
  
  v_plan_starter UUID;
  v_plan_growth UUID;
  v_plan_enterprise UUID;

  v_limit_contacts UUID;
  v_limit_users UUID;
  v_limit_broadcasts UUID;
BEGIN
  -- 1. PRODUCTS
  INSERT INTO saas_products (key, name, description) 
  VALUES ('wacrm', 'WhatsApp CRM', 'Core CRM and Messaging platform')
  ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_prod_wacrm;

  INSERT INTO saas_products (key, name, description) 
  VALUES ('wastore', 'WhatsApp Store', 'E-commerce storefront integration')
  ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_prod_wastore;

  -- 2. MODULES
  INSERT INTO saas_modules (product_id, key, name) VALUES (v_prod_wacrm, 'crm', 'Sales CRM') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_mod_crm;
  INSERT INTO saas_modules (product_id, key, name) VALUES (v_prod_wacrm, 'inbox', 'Shared Inbox') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_mod_inbox;
  INSERT INTO saas_modules (product_id, key, name) VALUES (v_prod_wacrm, 'marketing', 'Marketing Campaigns') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_mod_marketing;
  INSERT INTO saas_modules (product_id, key, name) VALUES (v_prod_wacrm, 'automation', 'Automations & Flows') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_mod_automation;
  INSERT INTO saas_modules (product_id, key, name) VALUES (v_prod_wastore, 'store', 'E-commerce Store') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_mod_store;

  -- 3. PERMISSIONS
  -- CRM Module
  INSERT INTO saas_permissions (module_id, key, name) VALUES 
    (v_mod_crm, 'contacts.view', 'View Contacts'),
    (v_mod_crm, 'contacts.create', 'Create Contacts'),
    (v_mod_crm, 'contacts.edit', 'Edit Contacts'),
    (v_mod_crm, 'contacts.delete', 'Delete Contacts'),
    (v_mod_crm, 'pipelines.view', 'View Pipelines & Deals'),
    (v_mod_crm, 'pipelines.manage', 'Manage Pipelines & Deals')
  ON CONFLICT (key) DO NOTHING;

  -- Inbox Module
  INSERT INTO saas_permissions (module_id, key, name) VALUES 
    (v_mod_inbox, 'inbox.view', 'View Conversations'),
    (v_mod_inbox, 'inbox.reply', 'Send Messages')
  ON CONFLICT (key) DO NOTHING;

  -- Marketing Module
  INSERT INTO saas_permissions (module_id, key, name) VALUES 
    (v_mod_marketing, 'broadcasts.view', 'View Broadcasts'),
    (v_mod_marketing, 'broadcasts.send', 'Send Broadcasts')
  ON CONFLICT (key) DO NOTHING;

  -- Automation Module
  INSERT INTO saas_permissions (module_id, key, name) VALUES 
    (v_mod_automation, 'automations.view', 'View Workflows'),
    (v_mod_automation, 'automations.manage', 'Create/Edit Workflows')
  ON CONFLICT (key) DO NOTHING;

  -- Store Module
  INSERT INTO saas_permissions (module_id, key, name) VALUES 
    (v_mod_store, 'store.view', 'View Store & Orders'),
    (v_mod_store, 'store.manage', 'Manage Products & Orders')
  ON CONFLICT (key) DO NOTHING;

  -- 4. FEATURES
  INSERT INTO saas_features (module_id, key, name) VALUES 
    (v_mod_inbox, 'ai_reply', 'AI Auto-Replies'),
    (v_mod_crm, 'api_access', 'Developer API Access')
  ON CONFLICT (key) DO NOTHING;

  -- 5. LIMITS
  INSERT INTO saas_limits (key, name, unit) VALUES ('contacts', 'Total Contacts', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_contacts;
  INSERT INTO saas_limits (key, name, unit) VALUES ('users', 'Team Members', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_users;
  INSERT INTO saas_limits (key, name, unit) VALUES ('broadcasts_per_month', 'Monthly Broadcasts', 'count') ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_limit_broadcasts;

  -- 6. PLANS
  -- Starter
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Starter', 'monthly', 2499.00) RETURNING id INTO v_plan_starter;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_starter, v_prod_wacrm);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES 
    (v_plan_starter, v_limit_contacts, 1000),
    (v_plan_starter, v_limit_users, 3),
    (v_plan_starter, v_limit_broadcasts, 2);

  -- Growth
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Growth', 'monthly', 6499.00) RETURNING id INTO v_plan_growth;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_growth, v_prod_wacrm);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES 
    (v_plan_growth, v_limit_contacts, 10000),
    (v_plan_growth, v_limit_users, 10),
    (v_plan_growth, v_limit_broadcasts, 10);

  -- Enterprise (Includes Store)
  INSERT INTO saas_plans (name, billing_interval, price) VALUES ('Enterprise', 'monthly', 16499.00) RETURNING id INTO v_plan_enterprise;
  INSERT INTO saas_plan_products (plan_id, product_id) VALUES (v_plan_enterprise, v_prod_wacrm), (v_plan_enterprise, v_prod_wastore);
  INSERT INTO saas_plan_limits (plan_id, limit_id, max_value) VALUES 
    (v_plan_enterprise, v_limit_contacts, 999999),
    (v_plan_enterprise, v_limit_users, 999),
    (v_plan_enterprise, v_limit_broadcasts, 999999);

END $$;
