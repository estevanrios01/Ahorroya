create index if not exists idx_store_product_history_store_product
  on public.store_product_history (store_product_id);

insert into public.store_product_history (store_product_id, price, available, captured_at)
select
  sp.id,
  sp.price,
  sp.available,
  coalesce(sp.captured_at, now())
from public.store_products sp
where not exists (
  select 1
  from public.store_product_history sph
  where sph.store_product_id = sp.id
);
