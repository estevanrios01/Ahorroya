-- search_products_by_city's empty-query (browse) branch built product_page
-- by grouping every matching store_products row by master_product_id and
-- sorting by min(name) before applying LIMIT/OFFSET -- Postgres can't use an
-- index for an aggregate-then-sort like that, so it had to scan and group
-- every available listing in the city (thousands of rows) on every single
-- call, even though only ~20 rows are ever returned. Verified live:
-- EXPLAIN ANALYZE showed 631ms for a plain Cali browse with no query.
--
-- The query-present branch right below it already solves the identical
-- problem correctly, with an EXISTS check driven by an index-ordered scan
-- on master_products(status, name) instead of aggregating first. Bringing
-- the empty-query branch in line with that already-proven pattern: same
-- 631ms case measured at 5.8ms after the rewrite (~108x), using indexes
-- that already existed (idx_master_products_status_name,
-- idx_store_products_master). Everything else in the function -- the price
-- lateral join, total_count, the query-present branch -- is untouched.
create or replace function public.search_products_by_city(
  p_q text default ''::text,
  p_city text default ''::text,
  p_category_id uuid default null::uuid,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table(
  id uuid, name text, slug text, short_name text, barcode text, ean text,
  image text, unit text, brand_name text, brand_slug text,
  category_name text, category_slug text, store_products jsonb, total_count bigint
)
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  if coalesce(p_q, '') = '' then
    return query
      with city_branches as (
        select br.id, br.city, br.name
        from public.branches br
        where br.status = 'active'
          and (coalesce(p_city, '') = '' or br.city ilike p_city)
      ),
      product_page as (
        select mp.id as master_product_id, mp.name::text as sort_name
        from public.master_products mp
        where mp.status = 'active'
          and (p_category_id is null or mp.category_id = p_category_id)
          and exists (
            select 1
            from public.store_products sp
            join city_branches cb on cb.id = sp.branch_id
            where sp.master_product_id = mp.id
              and sp.available = true
          )
        order by mp.name
        limit greatest(1, least(coalesce(p_limit, 20), 100))
        offset greatest(0, coalesce(p_offset, 0))
      ),
      approximate_total as (
        select count(*)::bigint as value
        from public.master_products mp
        where mp.status = 'active'
          and (p_category_id is null or mp.category_id = p_category_id)
      )
      select
        mp.id,
        mp.name::text,
        mp.slug::text,
        mp.short_name::text,
        mp.barcode::text,
        mp.ean::text,
        mp.image::text,
        mp.unit::text,
        b.name::text as brand_name,
        b.slug::text as brand_slug,
        c.name::text as category_name,
        c.slug::text as category_slug,
        coalesce(price_rows.store_products, '[]'::jsonb) as store_products,
        approximate_total.value as total_count
      from product_page pp
      join public.master_products mp on mp.id = pp.master_product_id
      left join public.brands b on b.id = mp.brand_id
      left join public.categories c on c.id = mp.category_id
      cross join approximate_total
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', ranked.id,
            'price', ranked.price,
            'original_price', ranked.original_price,
            'store_id', ranked.store_id,
            'available', ranked.available,
            'branch_id', ranked.branch_id,
            'store_name', ranked.store_name,
            'store_slug', ranked.store_slug,
            'branch_name', ranked.branch_name,
            'city', ranked.city
          )
          order by ranked.price asc
        ) as store_products
        from (
          select
            sp.id,
            sp.price,
            sp.original_price,
            sp.store_id,
            sp.available,
            sp.branch_id,
            s.name::text as store_name,
            s.slug::text as store_slug,
            cb.name::text as branch_name,
            cb.city::text as city
          from public.store_products sp
          join city_branches cb on cb.id = sp.branch_id
          left join public.stores s on s.id = sp.store_id
          where sp.master_product_id = mp.id
            and sp.available = true
          order by sp.price asc
          limit 12
        ) ranked
      ) price_rows on true
      order by pp.sort_name;
  else
    return query
      with city_branches as (
        select br.id, br.city, br.name
        from public.branches br
        where br.status = 'active'
          and (coalesce(p_city, '') = '' or br.city ilike p_city)
      ),
      candidates as (
        select
          mp.id,
          mp.name::text,
          mp.slug::text,
          mp.short_name::text,
          mp.barcode::text,
          mp.ean::text,
          mp.image::text,
          mp.unit::text,
          b.name::text as brand_name,
          b.slug::text as brand_slug,
          c.name::text as category_name,
          c.slug::text as category_slug,
          count(*) over() as total_count
        from public.master_products mp
        left join public.brands b on b.id = mp.brand_id
        left join public.categories c on c.id = mp.category_id
        where mp.status = 'active'
          and (p_category_id is null or mp.category_id = p_category_id)
          and (
            mp.name ilike '%' || p_q || '%'
            or mp.short_name ilike '%' || p_q || '%'
            or mp.barcode ilike '%' || p_q || '%'
            or mp.ean ilike '%' || p_q || '%'
            or b.name ilike '%' || p_q || '%'
          )
          and exists (
            select 1
            from public.store_products sp
            join city_branches cb on cb.id = sp.branch_id
            where sp.master_product_id = mp.id
              and sp.available = true
          )
        order by mp.name
        limit greatest(1, least(coalesce(p_limit, 20), 100))
        offset greatest(0, coalesce(p_offset, 0))
      )
      select
        candidates.id,
        candidates.name,
        candidates.slug,
        candidates.short_name,
        candidates.barcode,
        candidates.ean,
        candidates.image,
        candidates.unit,
        candidates.brand_name,
        candidates.brand_slug,
        candidates.category_name,
        candidates.category_slug,
        coalesce(price_rows.store_products, '[]'::jsonb) as store_products,
        candidates.total_count
      from candidates
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'id', ranked.id,
            'price', ranked.price,
            'original_price', ranked.original_price,
            'store_id', ranked.store_id,
            'available', ranked.available,
            'branch_id', ranked.branch_id,
            'store_name', ranked.store_name,
            'store_slug', ranked.store_slug,
            'branch_name', ranked.branch_name,
            'city', ranked.city
          )
          order by ranked.price asc
        ) as store_products
        from (
          select
            sp.id,
            sp.price,
            sp.original_price,
            sp.store_id,
            sp.available,
            sp.branch_id,
            s.name::text as store_name,
            s.slug::text as store_slug,
            cb.name::text as branch_name,
            cb.city::text as city
          from public.store_products sp
          join city_branches cb on cb.id = sp.branch_id
          left join public.stores s on s.id = sp.store_id
          where sp.master_product_id = candidates.id
            and sp.available = true
          order by sp.price asc
          limit 12
        ) ranked
      ) price_rows on true
      order by candidates.name;
  end if;
end;
$function$;
