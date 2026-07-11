create index if not exists idx_branches_city_status
  on public.branches (city, status);

create index if not exists idx_store_products_branch_available_master
  on public.store_products (branch_id, available, master_product_id);

create index if not exists idx_store_products_master_available_branch_price
  on public.store_products (master_product_id, available, branch_id, price);

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
language plpgsql
security invoker
as $$
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
        select sp.master_product_id, min(mp.name)::text as sort_name
        from public.store_products sp
        join city_branches cb on cb.id = sp.branch_id
        join public.master_products mp on mp.id = sp.master_product_id and mp.status = 'active'
        where sp.available = true
          and (p_category_id is null or mp.category_id = p_category_id)
        group by sp.master_product_id
        order by min(mp.name)
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
$$;

grant execute on function public.search_products_by_city(text, text, uuid, integer, integer)
  to anon, authenticated, service_role;
