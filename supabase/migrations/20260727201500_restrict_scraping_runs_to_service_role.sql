-- scraping_runs_select_public (roles {anon,authenticated}, qual true) let
-- anyone with the public anon key read full scraping run history --
-- including error_message text from failed runs -- directly against
-- PostgREST, with no app-level auth check possible. This is exactly the
-- "scraper health/failure counts" data the /api/observability/dashboard
-- route was deliberately gated behind a login for earlier in this project's
-- history; that gate did nothing to actually protect the data, since the
-- same rows were readable straight from the anon key regardless of what
-- the Next.js route required. Verified no live app code depends on
-- anon/authenticated-level access to this table: every real read
-- (app/api/observability/dashboard, app/api/scrapers/status) already goes
-- through the service_role client, which bypasses RLS entirely and is
-- unaffected by this change. The one client-side reader in services/
-- database.js (getLatestRun) is dead code, never called anywhere.

drop policy if exists scraping_runs_select_public on public.scraping_runs;
