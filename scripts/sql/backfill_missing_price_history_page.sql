create index if not exists idx_store_product_history_store_product
  on public.store_product_history (store_product_id);

create or replace function public.backfill_missing_price_history_page(
  p_after uuid default null,
  p_limit integer default 1000
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  inserted_count integer;
  scanned_count integer;
  next_cursor uuid;
begin
  with page as (
    select
      sp.id,
      sp.price,
      sp.available,
      coalesce(sp.captured_at, now()) as captured_at
    from public.store_products sp
    where p_after is null or sp.id > p_after
    order by sp.id
    limit greatest(1, least(coalesce(p_limit, 1000), 5000))
  ),
  inserted as (
    insert into public.store_product_history (store_product_id, price, available, captured_at)
    select page.id, page.price, page.available, page.captured_at
    from page
    where not exists (
      select 1
      from public.store_product_history sph
      where sph.store_product_id = page.id
    )
    returning 1
  )
  select
    (select count(*) from inserted),
    (select count(*) from page),
    (select id from page order by id desc limit 1)
  into inserted_count, scanned_count, next_cursor;

  return jsonb_build_object(
    'inserted', inserted_count,
    'scanned', scanned_count,
    'nextCursor', next_cursor
  );
end;
$$;

revoke all on function public.backfill_missing_price_history_page(uuid, integer) from public;
grant execute on function public.backfill_missing_price_history_page(uuid, integer) to service_role;
