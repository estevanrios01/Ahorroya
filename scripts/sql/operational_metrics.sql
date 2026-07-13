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

-- No se insertan métricas de demostración. El reporte se calcula desde las
-- tablas reales y solo una tarea operativa puede guardar una caché posterior.
