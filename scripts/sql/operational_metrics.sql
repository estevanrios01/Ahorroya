create table if not exists public.operational_metrics (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz default now() not null
);

alter table public.operational_metrics enable row level security;

drop policy if exists "operational_metrics_select_public" on public.operational_metrics;
create policy "operational_metrics_select_public"
  on public.operational_metrics
  for select
  to anon, authenticated
  using (true);

drop policy if exists "operational_metrics_write_service" on public.operational_metrics;
create policy "operational_metrics_write_service"
  on public.operational_metrics
  for all
  to service_role
  using (true)
  with check (true);

grant select on public.operational_metrics to anon, authenticated;
grant all on public.operational_metrics to service_role;

insert into public.operational_metrics (key, payload, updated_at)
values (
  'quality_report',
  jsonb_build_object(
    'totalProducts', 10476,
    'totalStores', 15,
    'totalPrices', 972015,
    'totalBrands', 73,
    'totalCategories', 13,
    'latestPriceCapturedAt', (select max(captured_at) from public.store_products),
    'issues', jsonb_build_object(
      'duplicates', 0,
      'anomalousPrices', 0,
      'imageIssues', 0,
      'invalidEan', 0,
      'missingCategory', 0,
      'missingBrand', 0
    ),
    'lastScraping', null
  ),
  now()
)
on conflict (key) do update
set payload = excluded.payload,
    updated_at = excluded.updated_at;
