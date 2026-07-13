create extension if not exists pg_trgm with schema extensions;

create index if not exists idx_master_products_name_trgm
  on public.master_products using gin (name extensions.gin_trgm_ops);

create index if not exists idx_master_products_short_name_trgm
  on public.master_products using gin (short_name extensions.gin_trgm_ops)
  where short_name is not null;

create index if not exists idx_master_products_active_category_name
  on public.master_products (category_id, name, id)
  where status = 'active';

create index if not exists idx_master_products_active_brand_name
  on public.master_products (brand_id, name, id)
  where status = 'active';

create index if not exists idx_store_products_active_master_price
  on public.store_products (master_product_id, price, store_id)
  where available = true;

create index if not exists idx_store_products_active_store_updated
  on public.store_products (store_id, updated_at desc, master_product_id)
  where available = true;

create index if not exists idx_branches_active_city_store
  on public.branches (city, store_id)
  where status = 'active';

create index if not exists idx_branches_active_department_store
  on public.branches (department, store_id)
  where status = 'active';

create table if not exists public.operational_metrics (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz default now() not null
);

alter table public.operational_metrics enable row level security;

drop policy if exists "operational_metrics_select_public" on public.operational_metrics;
create policy "operational_metrics_select_public"
  on public.operational_metrics for select to anon, authenticated using (true);

drop policy if exists "operational_metrics_write_service" on public.operational_metrics;
create policy "operational_metrics_write_service"
  on public.operational_metrics for all to service_role using (true) with check (true);

grant select on public.operational_metrics to anon, authenticated;
grant all on public.operational_metrics to service_role;

create or replace function public.catalog_storage_report()
returns table (
  table_name text,
  estimated_rows bigint,
  total_bytes bigint,
  table_bytes bigint,
  index_bytes bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    relname::text,
    n_live_tup::bigint,
    pg_total_relation_size(relid)::bigint,
    pg_relation_size(relid)::bigint,
    pg_indexes_size(relid)::bigint
  from pg_stat_user_tables
  where schemaname = 'public'
  order by pg_total_relation_size(relid) desc;
$$;

revoke all on function public.catalog_storage_report() from public, anon, authenticated;
grant execute on function public.catalog_storage_report() to service_role;

create or replace function public.prune_catalog_operational_data(
  p_history_days integer default 90,
  p_run_days integer default 14,
  p_event_days integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  deleted_history bigint := 0;
  deleted_runs bigint := 0;
  deleted_jobs bigint := 0;
  deleted_events bigint := 0;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service_role required';
  end if;

  with old_history as (
    select id
    from (
      select
        id,
        row_number() over (
          partition by store_product_id
          order by captured_at desc nulls last, id desc
        ) as position
      from public.store_product_history
      where captured_at < now() - make_interval(days => greatest(p_history_days, 7))
    ) ranked
    where position > 1
  )
  delete from public.store_product_history history
  using old_history
  where history.id = old_history.id;
  get diagnostics deleted_history = row_count;

  delete from public.scraping_runs
  where started_at < now() - make_interval(days => greatest(p_run_days, 3));
  get diagnostics deleted_runs = row_count;

  delete from public.scraping_jobs
  where created_at < now() - make_interval(days => greatest(p_run_days, 3))
    and status in ('completed', 'failed', 'cancelled');
  get diagnostics deleted_jobs = row_count;

  delete from public.analytics_events
  where created_at < now() - make_interval(days => greatest(p_event_days, 7));
  get diagnostics deleted_events = row_count;

  return jsonb_build_object(
    'history', deleted_history,
    'runs', deleted_runs,
    'jobs', deleted_jobs,
    'events', deleted_events
  );
end;
$$;

revoke all on function public.prune_catalog_operational_data(integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.prune_catalog_operational_data(integer, integer, integer)
  to service_role;
