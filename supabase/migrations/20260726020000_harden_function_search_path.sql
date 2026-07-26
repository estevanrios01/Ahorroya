-- Pins search_path on the two SECURITY INVOKER functions from 00002_security_policies.sql
-- (flagged by Supabase's function_search_path_mutable advisor).

CREATE OR REPLACE FUNCTION get_product_price_history(p_product_id UUID)
RETURNS TABLE (
  id UUID,
  price NUMERIC,
  captured_at TIMESTAMPTZ,
  store_name VARCHAR,
  store_slug VARCHAR
) LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
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
) LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
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
