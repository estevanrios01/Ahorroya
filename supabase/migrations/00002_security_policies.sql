-- AhorroYa - Políticas de Seguridad RLS
-- Habilita Row Level Security y permisos explícitos para Data API.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE basket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Lectura pública controlada por RLS.
CREATE POLICY "brands_select_public" ON brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_select_public" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "master_products_select_public" ON master_products FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "stores_select_public" ON stores FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "branches_select_public" ON branches FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "store_products_select_public" ON store_products FOR SELECT TO anon, authenticated USING (available = true);
CREATE POLICY "store_product_history_select_public" ON store_product_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_images_select_public" ON product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "inventory_select_public" ON inventory FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "scraping_runs_select_public" ON scraping_runs FOR SELECT TO anon, authenticated USING (true);

-- Datos propios de usuarios autenticados.
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "baskets_select_own" ON baskets FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "baskets_insert_own" ON baskets FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "baskets_update_own" ON baskets FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "baskets_delete_own" ON baskets FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

CREATE POLICY "basket_items_select_own" ON basket_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = (select auth.uid()))
);
CREATE POLICY "basket_items_insert_own" ON basket_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = (select auth.uid()))
);
CREATE POLICY "basket_items_update_own" ON basket_items FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = (select auth.uid()))
) WITH CHECK (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = (select auth.uid()))
);
CREATE POLICY "basket_items_delete_own" ON basket_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = (select auth.uid()))
);

-- Operación server-side con service_role.
CREATE POLICY "scraping_jobs_select_admin" ON scraping_jobs FOR SELECT TO service_role USING (true);
CREATE POLICY "scraping_jobs_insert_admin" ON scraping_jobs FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "scraping_jobs_update_admin" ON scraping_jobs FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "scraping_jobs_delete_admin" ON scraping_jobs FOR DELETE TO service_role USING (true);

CREATE POLICY "analytics_events_insert_service" ON analytics_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "analytics_events_select_admin" ON analytics_events FOR SELECT TO service_role USING (true);

CREATE POLICY "brands_write_admin" ON brands FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "categories_write_admin" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "master_products_write_admin" ON master_products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "stores_write_admin" ON stores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "branches_write_admin" ON branches FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "store_products_write_admin" ON store_products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "store_product_history_write_admin" ON store_product_history FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "product_images_write_admin" ON product_images FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "inventory_write_admin" ON inventory FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "scraping_runs_write_admin" ON scraping_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION get_product_price_history(p_product_id UUID)
RETURNS TABLE (
  id UUID,
  price NUMERIC,
  captured_at TIMESTAMPTZ,
  store_name VARCHAR,
  store_slug VARCHAR
) LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  RETURN QUERY
  SELECT sph.id, sph.price, sph.captured_at, s.name, s.slug
  FROM store_product_history sph
  JOIN store_products sp ON sp.id = sph.store_product_id
  JOIN stores s ON s.id = sp.store_id
  WHERE sp.master_product_id = p_product_id
  ORDER BY sph.captured_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION search_products(search_query TEXT, page_size INT DEFAULT 20, page_num INT DEFAULT 1)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  brand VARCHAR,
  category VARCHAR,
  image VARCHAR,
  min_price NUMERIC,
  max_price NUMERIC,
  store_count BIGINT
) LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  RETURN QUERY
  SELECT
    mp.id, mp.name, mp.slug,
    b.name AS brand, c.name AS category,
    mp.image,
    MIN(sp.price) AS min_price,
    MAX(sp.price) AS max_price,
    COUNT(DISTINCT sp.store_id) AS store_count
  FROM master_products mp
  LEFT JOIN brands b ON b.id = mp.brand_id
  LEFT JOIN categories c ON c.id = mp.category_id
  JOIN store_products sp ON sp.master_product_id = mp.id AND sp.available = true
  WHERE mp.status = 'active'
    AND (search_query = '' OR mp.name ILIKE '%' || search_query || '%' OR b.name ILIKE '%' || search_query || '%')
  GROUP BY mp.id, mp.name, mp.slug, b.name, c.name, mp.image
  ORDER BY mp.name
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON brands, categories, master_products, stores, branches, store_products, store_product_history, product_images, inventory, scraping_runs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION get_product_price_history(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_products(TEXT, INT, INT) TO anon, authenticated, service_role;
