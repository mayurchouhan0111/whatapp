-- ============================================================
-- 028_storefront.sql — Storefront & Product Catalog Integration
--
-- Adds:
--   1. Gating columns to `accounts` (`allow_store`, `store_expires_at`, `max_products`, `max_orders_per_month`)
--   2. `store_configs` table for business storefront settings
--   3. `products` table for catalog items with dual pricing
--   4. `orders` table for tracking checkout purchases
--   5. Row Level Security (RLS) policies for storefront tables
--   6. DB enforcement trigger for product limit checks
--
-- Idempotent — safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. Gating columns on accounts
-- ============================================================
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS allow_store             BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS store_expires_at        TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_products            INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_orders_per_month    INTEGER     NOT NULL DEFAULT 0;

-- ============================================================
-- 2. Store Configs Table
-- ============================================================
CREATE TABLE IF NOT EXISTS store_configs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  description      text,
  banner_url       text,
  whatsapp_number  text,
  upi_id           text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_configs_account_id_idx ON store_configs(account_id);
CREATE INDEX IF NOT EXISTS store_configs_slug_idx ON store_configs(slug);

-- ============================================================
-- 3. Products Table
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  regular_price    numeric(10, 2) NOT NULL,
  sale_price       numeric(10, 2) NOT NULL,
  image_url        text,
  category         text NOT NULL DEFAULT 'General',
  is_available     boolean NOT NULL DEFAULT true,
  position         integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_sale_price CHECK (sale_price <= regular_price)
);

CREATE INDEX IF NOT EXISTS products_account_id_idx ON products(account_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

-- ============================================================
-- 4. Orders Table
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id       uuid REFERENCES contacts(id) ON DELETE SET NULL,
  customer_name    text NOT NULL,
  customer_phone   text NOT NULL,
  delivery_address text NOT NULL,
  total_amount     numeric(10, 2) NOT NULL,
  payment_method   text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi')),
  payment_status   text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status     text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  items            jsonb NOT NULL, -- Array of items: {product_id, name, quantity, price}
  deal_id          uuid REFERENCES deals(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_account_id_idx ON orders(account_id);
CREATE INDEX IF NOT EXISTS orders_contact_id_idx ON orders(contact_id);

-- ============================================================
-- 5. Row Level Security (RLS)
-- ============================================================
ALTER TABLE store_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- store_configs policies
DROP POLICY IF EXISTS store_configs_select ON store_configs;
CREATE POLICY store_configs_select ON store_configs FOR SELECT
  USING (is_active = true OR is_account_member(account_id));

DROP POLICY IF EXISTS store_configs_all_admin ON store_configs;
CREATE POLICY store_configs_all_admin ON store_configs FOR ALL
  USING (is_account_member(account_id, 'admin'));

-- products policies
DROP POLICY IF EXISTS products_select ON products;
CREATE POLICY products_select ON products FOR SELECT
  USING (is_available = true OR is_account_member(account_id));

DROP POLICY IF EXISTS products_all_admin ON products;
CREATE POLICY products_all_admin ON products FOR ALL
  USING (is_account_member(account_id, 'admin'));

-- orders policies
DROP POLICY IF EXISTS orders_select ON orders;
CREATE POLICY orders_select ON orders FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT
  WITH CHECK (true); -- Public customers can place orders

DROP POLICY IF EXISTS orders_all_admin ON orders;
CREATE POLICY orders_all_admin ON orders FOR ALL
  USING (is_account_member(account_id, 'admin'));

-- ============================================================
-- 6. DB Trigger: Enforce max_products limit
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_product_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max INTEGER;
  v_current INTEGER;
BEGIN
  SELECT max_products INTO v_max FROM accounts WHERE id = NEW.account_id;
  IF v_max IS NULL THEN
    RAISE EXCEPTION 'Account not found' USING ERRCODE = '22023';
  END IF;
  SELECT COUNT(*) INTO v_current FROM products WHERE account_id = NEW.account_id;
  IF v_current >= v_max THEN
    RAISE EXCEPTION 'Product limit reached (%) for this account. Please upgrade your plan to add more.', v_max
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.check_product_limit() OWNER TO postgres;

DROP TRIGGER IF EXISTS check_product_limit_before_insert ON products;
CREATE TRIGGER check_product_limit_before_insert
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_product_limit();
