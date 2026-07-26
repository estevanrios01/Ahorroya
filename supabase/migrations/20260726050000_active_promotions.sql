-- Real active-discount listing, backing a proper /api/promotions --
-- the route previously just listed scraping_jobs and never returned
-- actual promotions. A product is "on promotion" when the retailer's
-- own original_price/list_price is higher than the current price,
-- exactly what already gets captured on every import.

create index if not exists idx_store_products_active_discount
  on public.store_products (available, original_price, price)
  where available = true and original_price is not null;

create or replace function public.list_active_promotions(p_limit integer default 20)
returns table (
  store_product_id uuid,
  price numeric,
  original_price numeric,
  discount_percent int,
  product_id uuid,
  product_name text,
  product_slug text,
  product_image text,
  store_name text,
  store_slug text,
  captured_at timestamptz
)
language sql
security invoker
set search_path = public, pg_temp
as $$
  select
    sp.id,
    sp.price,
    sp.original_price,
    round(((sp.original_price - sp.price) / sp.original_price) * 100)::int as discount_percent,
    mp.id,
    mp.name::text,
    mp.slug::text,
    mp.image::text,
    s.name::text,
    s.slug::text,
    sp.captured_at
  from public.store_products sp
  join public.master_products mp on mp.id = sp.master_product_id and mp.status = 'active'
  join public.stores s on s.id = sp.store_id and s.status = 'active'
  where sp.available = true
    and sp.original_price is not null
    and sp.original_price > sp.price
  order by discount_percent desc, sp.captured_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.list_active_promotions(integer) to anon, authenticated, service_role;
