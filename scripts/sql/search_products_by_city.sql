create index if not exists idx_branches_city_status
  on public.branches (city, status);

create index if not exists idx_store_products_branch_available_master
  on public.store_products (branch_id, available, master_product_id);

create index if not exists idx_master_products_status_name
  on public.master_products (status, name);

create or replace function public.search_products_by_city(
  p_q text default '',
  p_city text default '',
  p_category_id uuid default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  name text,
  slug text,
  short_name text,
  barcode text,
  ean text,
  image text,
  unit text,
  brand_name text,
  brand_slug text,
  category_name text,
  category_slug text,
  store_products jsonb,
  total_count bigint
)
language sql
security invoker
as $$
  with matched as (
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
      sp.id as store_product_id,
      sp.price,
      sp.original_price,
      sp.store_id,
      sp.available,
      sp.branch_id,
      s.name::text as store_name,
      s.slug::text as store_slug,
      br.city::text,
      br.name::text as branch_name
    from public.store_products sp
    join public.branches br
      on br.id = sp.branch_id
      and br.status = 'active'
    join public.master_products mp
      on mp.id = sp.master_product_id
      and mp.status = 'active'
    left join public.brands b on b.id = mp.brand_id
    left join public.categories c on c.id = mp.category_id
    left join public.stores s on s.id = sp.store_id
    where sp.available = true
      and (coalesce(p_city, '') = '' or br.city ilike p_city)
      and (p_category_id is null or mp.category_id = p_category_id)
      and (
        coalesce(p_q, '') = ''
        or mp.name ilike '%' || p_q || '%'
        or mp.short_name ilike '%' || p_q || '%'
        or mp.barcode ilike '%' || p_q || '%'
        or mp.ean ilike '%' || p_q || '%'
        or b.name ilike '%' || p_q || '%'
      )
  ),
  grouped as (
    select
      matched.id,
      matched.name,
      matched.slug,
      matched.short_name,
      matched.barcode,
      matched.ean,
      matched.image,
      matched.unit,
      matched.brand_name,
      matched.brand_slug,
      matched.category_name,
      matched.category_slug,
      jsonb_agg(
        jsonb_build_object(
          'id', matched.store_product_id,
          'price', matched.price,
          'original_price', matched.original_price,
          'store_id', matched.store_id,
          'available', matched.available,
          'branch_id', matched.branch_id,
          'store_name', matched.store_name,
          'store_slug', matched.store_slug,
          'branch_name', matched.branch_name,
          'city', matched.city
        )
        order by matched.price asc
      ) as store_products
    from matched
    group by
      matched.id,
      matched.name,
      matched.slug,
      matched.short_name,
      matched.barcode,
      matched.ean,
      matched.image,
      matched.unit,
      matched.brand_name,
      matched.brand_slug,
      matched.category_name,
      matched.category_slug
  ),
  counted as (
    select grouped.*, count(*) over() as total_count
    from grouped
  )
  select
    counted.id,
    counted.name,
    counted.slug,
    counted.short_name,
    counted.barcode,
    counted.ean,
    counted.image,
    counted.unit,
    counted.brand_name,
    counted.brand_slug,
    counted.category_name,
    counted.category_slug,
    counted.store_products,
    counted.total_count
  from counted
  order by counted.name
  limit greatest(1, least(coalesce(p_limit, 20), 100))
  offset greatest(0, coalesce(p_offset, 0));
$$;

grant execute on function public.search_products_by_city(text, text, uuid, integer, integer)
  to anon, authenticated, service_role;
