-- ============================================================
-- SEED DATA — Safe to run multiple times (idempotent).
-- Inserts demo contacts, pipeline, deals, broadcasts, store
-- products, and a store config for the first account found.
-- ============================================================

-- Grab the first real account + user (skip if no data yet)
DO $$
DECLARE
  v_account_id UUID;
  v_user_id UUID;
  v_profile_id UUID;
  v_pipeline_id UUID;
  v_stage_new UUID;
  v_stage_qualified UUID;
  v_stage_proposal UUID;
  v_stage_negotiation UUID;
  v_stage_closed UUID;
  v_contact_1_id UUID;
  v_contact_2_id UUID;
  v_contact_3_id UUID;
  v_store_id UUID;
  v_broadcast_id UUID;
BEGIN

  -- Only seed if accounts exist and no demo data has been seeded
  SELECT id, owner_user_id INTO v_account_id, v_user_id
  FROM accounts
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_account_id IS NULL THEN
    RAISE NOTICE 'No accounts found — skipping seed. Create a user first.';
    RETURN;
  END IF;

  -- Resolve profile
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE user_id = v_user_id AND account_id = v_account_id;

  IF v_profile_id IS NULL THEN
    RAISE NOTICE 'No profile found for user % — skipping seed.', v_user_id;
    RETURN;
  END IF;

  -- Check if already seeded (look for demo contacts)
  IF EXISTS (SELECT 1 FROM contacts WHERE name LIKE 'Demo:%' AND account_id = v_account_id) THEN
    RAISE NOTICE 'Demo data already exists for account % — skipping.', v_account_id;
    RETURN;
  END IF;

  -- ============================================================
  -- CONTACTS (3 demo contacts)
  -- ============================================================
  INSERT INTO contacts (user_id, account_id, phone, name, email, company)
  VALUES
    (v_user_id, v_account_id, '+919876543210', 'Demo: Priya Sharma', 'priya@example.com', 'Urban Boutique'),
    (v_user_id, v_account_id, '+919876543211', 'Demo: Rajesh Patel', 'rajesh@example.com', 'Patel Enterprises'),
    (v_user_id, v_account_id, '+919876543212', 'Demo: Anita Gupta', 'anita@example.com', 'Gupta Consulting');

  SELECT id INTO v_contact_1_id FROM contacts WHERE phone = '+919876543210' AND account_id = v_account_id;
  SELECT id INTO v_contact_2_id FROM contacts WHERE phone = '+919876543211' AND account_id = v_account_id;
  SELECT id INTO v_contact_3_id FROM contacts WHERE phone = '+919876543212' AND account_id = v_account_id;

  -- ============================================================
  -- PIPELINE with 5 stages
  -- ============================================================
  INSERT INTO pipelines (user_id, account_id, name)
  VALUES (v_user_id, v_account_id, 'Sales Pipeline')
  RETURNING id INTO v_pipeline_id;

  INSERT INTO pipeline_stages (pipeline_id, name, position, color)
  VALUES
    (v_pipeline_id, 'New Lead',    0, '#3b82f6'),
    (v_pipeline_id, 'Qualified',   1, '#8b5cf6'),
    (v_pipeline_id, 'Proposal',    2, '#f59e0b'),
    (v_pipeline_id, 'Negotiation', 3, '#f97316'),
    (v_pipeline_id, 'Closed Won',  4, '#22c55e');

  SELECT id INTO v_stage_new         FROM pipeline_stages WHERE pipeline_id = v_pipeline_id AND position = 0;
  SELECT id INTO v_stage_qualified   FROM pipeline_stages WHERE pipeline_id = v_pipeline_id AND position = 1;
  SELECT id INTO v_stage_proposal    FROM pipeline_stages WHERE pipeline_id = v_pipeline_id AND position = 2;
  SELECT id INTO v_stage_negotiation FROM pipeline_stages WHERE pipeline_id = v_pipeline_id AND position = 3;
  SELECT id INTO v_stage_closed      FROM pipeline_stages WHERE pipeline_id = v_pipeline_id AND position = 4;

  -- Deals
  INSERT INTO deals (user_id, account_id, pipeline_id, stage_id, contact_id, title, value, currency, status)
  VALUES
    (v_user_id, v_account_id, v_pipeline_id, v_stage_new,         v_contact_1_id, 'Boutique Website Package',  45000, 'INR', 'open'),
    (v_user_id, v_account_id, v_pipeline_id, v_stage_qualified,   v_contact_2_id, 'Enterprise CRM License',    120000, 'INR', 'open'),
    (v_user_id, v_account_id, v_pipeline_id, v_stage_proposal,    v_contact_3_id, 'Consulting Retainer',        60000, 'INR', 'open');

  -- ============================================================
  -- BROADCAST (1 sample broadcast with sent data)
  -- ============================================================
  INSERT INTO broadcasts (user_id, account_id, name, template_name, status, total_recipients, sent_count, delivered_count, read_count)
  VALUES (v_user_id, v_account_id, 'Welcome Campaign - New Signups', 'welcome_message', 'sent', 150, 150, 142, 98)
  RETURNING id INTO v_broadcast_id;

  -- ============================================================
  -- STORE CONFIG + PRODUCTS
  -- ============================================================
  INSERT INTO store_configs (account_id, slug, name, description, is_active)
  VALUES (v_account_id, 'demo-store', 'Demo Store', 'Your demo online store — powered by WACRM', true)
  RETURNING id INTO v_store_id;

  -- Enable store for this account
  UPDATE accounts
  SET allow_store = true
  WHERE id = v_account_id;

  INSERT INTO products (account_id, name, description, regular_price, sale_price, category, is_available, position)
  VALUES
    (v_account_id, 'Handcrafted Leather Bag',   'Premium genuine leather bag',    2999, 2499, 'Fashion',  true, 1),
    (v_account_id, 'Wireless Bluetooth Earbuds', 'Noise-cancelling wireless earbuds', 1999, 1599, 'Electronics', true, 2),
    (v_account_id, 'Organic Green Tea Set',      'Premium organic green tea gift box', 899,  699, 'Food', true, 3);

  RAISE NOTICE 'Seed data inserted successfully for account %', v_account_id;
END $$;
