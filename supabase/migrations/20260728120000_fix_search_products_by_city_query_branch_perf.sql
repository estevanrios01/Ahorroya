-- Continuing the perf fix from 20260728110000 (which addressed the empty-query
-- browse branch). This migration addresses the query-present (actual text
-- search) branch, found while verifying that fix: EXPLAIN ANALYZE showed
-- ~540ms inside the live function for a plain text search, and isolating the
-- cause showed count(*) over() forces Postgres to fully materialize every
-- row matching the WHERE clause (text match + per-city EXISTS) before it can
-- assign a per-row window value -- even though only one page (<=100 rows) is
-- ever returned. Measured a genuinely separate, non-windowed COUNT(*) with
-- the exact same filters (text match + per-city EXISTS + brand join): 2.8
-- seconds standalone, worse than the whole original query -- confirming an
-- *exact* city-scoped total is not fast here regardless of how it's computed.
--
-- The empty-query branch already made this tradeoff for the identical reason
-- (see its own approximate_total CTE): compute an approximate total from a
-- cheaper, non-city-scoped condition instead of an exact one. Applying the
-- same tradeoff here -- approximate_total now matches on name/short_name
-- (both trigram-indexed) plus barcode/ean, skipping only the brand-name
-- match and the per-city EXISTS check for the COUNT specifically. Measured
-- 163ms for this on the same "leche" case (also using the trigram indexes),
-- vs 2.8s exact and worse than that when embedded as a window function.
--
-- The actual returned products (candidates) are completely unaffected: they
-- keep the full brand-name match and the real per-city availability check,
-- exactly as before. Only the informational total_count number becomes an
-- approximation -- verified this is the same tradeoff already accepted for
-- the browse branch, and total_count/pages aren't used for real pagination
-- logic anywhere in the frontend (grepped: only rendered as display text).
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
          c.slug::text as category_slug
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
      ),
      approximate_total as (
        select count(*)::bigint as value
        from public.master_products mp
        where mp.status = 'active'
          and (p_category_id is null or mp.category_id = p_category_id)
          and (
            mp.name ilike '%' || p_q || '%'
            or mp.short_name ilike '%' || p_q || '%'
            or mp.barcode ilike '%' || p_q || '%'
            or mp.ean ilike '%' || p_q || '%'
          )
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
        approximate_total.value as total_count
      from candidates
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
