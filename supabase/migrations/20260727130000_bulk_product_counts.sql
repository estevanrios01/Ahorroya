-- /api/categories and /api/brands each computed per-item product counts by
-- firing one COUNT query per row via Promise.all -- with 299 categories and
-- 1,216 brands live in the DB today, every cache-miss on those two routes
-- fired ~1,515 simultaneous queries at a free-tier Postgres instance. That
-- both risks the connection-pool limit under real load and is a very
-- plausible contributor to the transient "fetch failed" / connection errors
-- already patched around (with retries) elsewhere this session, without
-- fixing the actual cause. These two RPCs replace 1,515 queries with 2,
-- returning per-id counts in one grouped aggregate each; both existing
-- partial indexes (idx_master_products_active_category_name,
-- idx_master_products_active_brand_name) already cover this exact
-- (status='active', group by category_id/brand_id) access pattern.

create or replace function public.count_products_by_category()
returns table (category_id uuid, product_count bigint)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select category_id, count(*)::bigint as product_count
  from public.master_products
  where status = 'active' and category_id is not null
  group by category_id;
$$;

create or replace function public.count_products_by_brand()
returns table (brand_id uuid, product_count bigint)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select brand_id, count(*)::bigint as product_count
  from public.master_products
  where status = 'active' and brand_id is not null
  group by brand_id;
$$;

grant execute on function public.count_products_by_category() to anon, authenticated, service_role;
grant execute on function public.count_products_by_brand() to anon, authenticated, service_role;
