-- AhorroYa emergency Supabase cleanup
-- Use only when the project exceeded database space / Disk IO budget.
-- Run in Supabase SQL Editor after taking a backup if possible.
-- Execute during low traffic. Do not run while importers are active.

-- 1) Inspect largest public tables before deleting anything.
select
  schemaname,
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(format('%I.%I', schemaname, relname)::regclass)) as total_size,
  n_live_tup as estimated_rows
from pg_stat_user_tables
where schemaname = 'public'
order by pg_total_relation_size(format('%I.%I', schemaname, relname)::regclass) desc;

-- 2) Keep current product listings, but trim old price history.
--    We keep:
--    - all events from the last 14 days
--    - the latest event for every store_product_id
with ranked_history as (
  select
    id,
    row_number() over (
      partition by store_product_id
      order by captured_at desc nulls last, id desc
    ) as rn
  from public.store_product_history
  where captured_at < now() - interval '14 days'
)
delete from public.store_product_history sph
using ranked_history rh
where sph.id = rh.id
  and rh.rn > 1;

-- 3) Remove noisy operational logs older than 7 days.
delete from public.scraping_runs
where started_at < now() - interval '7 days';

delete from public.scraping_jobs
where created_at < now() - interval '7 days'
  and status in ('completed', 'failed', 'cancelled');

delete from public.analytics_events
where created_at < now() - interval '14 days';

-- 4) Remove non-primary duplicate image rows for the same product/url.
with duplicate_images as (
  select
    id,
    row_number() over (
      partition by master_product_id, url
      order by is_primary desc, created_at desc, id desc
    ) as rn
  from public.product_images
)
delete from public.product_images pi
using duplicate_images di
where pi.id = di.id
  and di.rn > 1;

-- 5) Refresh planner stats so REST counts and queries stop doing extra work.
vacuum analyze public.brands;
vacuum analyze public.categories;
vacuum analyze public.stores;
vacuum analyze public.branches;
vacuum analyze public.master_products;
vacuum analyze public.store_products;
vacuum analyze public.store_product_history;
vacuum analyze public.product_images;
vacuum analyze public.scraping_jobs;
vacuum analyze public.scraping_runs;
vacuum analyze public.analytics_events;

-- 6) Inspect largest tables after cleanup.
select
  schemaname,
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(format('%I.%I', schemaname, relname)::regclass)) as total_size,
  n_live_tup as estimated_rows
from pg_stat_user_tables
where schemaname = 'public'
order by pg_total_relation_size(format('%I.%I', schemaname, relname)::regclass) desc;
