-- Promoted from scripts/sql/quality_report_indexes.sql, which was never
-- added to supabase/migrations/. app/api/quality/report/route.js queries
-- store_products ordered by captured_at desc (getLatestPriceCapturedAt) on
-- every cache miss; nothing in the applied migrations covered that column.

create index if not exists idx_store_products_captured_at_desc
  on public.store_products (captured_at desc);
