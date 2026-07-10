-- AhorroYa - Políticas de Seguridad RLS
-- Habilita Row Level Security en todas las tablas
-- Define políticas por rol (public, authenticated, service_role)

-- Habilitar RLS en todas las tablas
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

-- ==========================================
-- POLÍTICAS PARA ROL ANONYMOUS (público)
-- ==========================================

-- usuarios: solo lectura de datos básicos
CREATE POLICY "users_select_public" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (true);

-- marcas: lectura pública
CREATE POLICY "brands_select_public" ON brands FOR SELECT USING (true);

-- categorías: lectura pública
CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);

-- productos maestros: solo activos para lectura pública
CREATE POLICY "master_products_select_public" ON master_products FOR SELECT USING (status = 'active');

-- comercios: solo activos para lectura pública
CREATE POLICY "stores_select_public" ON stores FOR SELECT USING (status = 'active');

-- sucursales: solo activas para lectura pública
CREATE POLICY "branches_select_public" ON branches FOR SELECT USING (status = 'active');

-- productos por tienda: solo disponibles
CREATE POLICY "store_products_select_public" ON store_products FOR SELECT USING (available = true);

-- historial de precios: lectura pública
CREATE POLICY "store_product_history_select_public" ON store_product_history FOR SELECT USING (true);

-- imágenes de productos: lectura pública
CREATE POLICY "product_images_select_public" ON product_images FOR SELECT USING (true);

-- scraping runs: lectura pública (solo metadata)
CREATE POLICY "scraping_runs_select_public" ON scraping_runs FOR SELECT USING (true);

-- ==========================================
-- POLÍTICAS PARA ROL AUTHENTICATED
-- ==========================================

-- usuarios: cada usuario ve y edita su propio perfil
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- canastas: cada usuario ve y edita sus propias canastas
CREATE POLICY "baskets_select_own" ON baskets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "baskets_insert_own" ON baskets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "baskets_update_own" ON baskets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "baskets_delete_own" ON baskets FOR DELETE USING (auth.uid() = user_id);

-- items de canasta: cada usuario ve y edita sus propios items
CREATE POLICY "basket_items_select_own" ON basket_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = auth.uid())
);
CREATE POLICY "basket_items_insert_own" ON basket_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = auth.uid())
);
CREATE POLICY "basket_items_update_own" ON basket_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = auth.uid())
);
CREATE POLICY "basket_items_delete_own" ON basket_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM baskets WHERE baskets.id = basket_items.basket_id AND baskets.user_id = auth.uid())
);

-- ==========================================
-- POLÍTICAS PARA SERVICE_ROLE (admin)
-- ==========================================

-- scraping_jobs: solo service_role puede modificar
CREATE POLICY "scraping_jobs_select_admin" ON scraping_jobs FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "scraping_jobs_insert_admin" ON scraping_jobs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "scraping_jobs_update_admin" ON scraping_jobs FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "scraping_jobs_delete_admin" ON scraping_jobs FOR DELETE USING (auth.role() = 'service_role');

-- analytics_events: solo inserción desde el servidor
CREATE POLICY "analytics_events_insert_service" ON analytics_events FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "analytics_events_select_admin" ON analytics_events FOR SELECT USING (auth.role() = 'service_role');

-- inventory: solo service_role puede modificar
CREATE POLICY "inventory_select_public" ON inventory FOR SELECT USING (true);
CREATE POLICY "inventory_insert_admin" ON inventory FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "inventory_update_admin" ON inventory FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- store_products: service_role puede hacer CRUD completo
CREATE POLICY "store_products_insert_admin" ON store_products FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "store_products_update_admin" ON store_products FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- store_product_history: service_role puede insertar
CREATE POLICY "store_product_history_insert_admin" ON store_product_history FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- scraping_runs: service_role puede insertar
CREATE POLICY "scraping_runs_insert_admin" ON scraping_runs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "scraping_runs_update_admin" ON scraping_runs FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- FUNCIONES ÚTILES
-- ==========================================

CREATE OR REPLACE FUNCTION get_product_price_history(p_product_id UUID)
RETURNS TABLE (
  id UUID,
  price NUMERIC,
  captured_at TIMESTAMPTZ,
  store_name VARCHAR,
  store_slug VARCHAR
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
