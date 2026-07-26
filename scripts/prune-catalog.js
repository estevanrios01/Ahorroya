// Calls prune_catalog_operational_data() (added in migration
// 20260713120000, alongside catalog_storage_report()) -- it existed since
// that migration but nothing ever actually called it, so it did nothing
// to stop the exact kind of unbounded history growth that already once
// pushed the project over the free tier's space limit.
'use strict';

const { loadEnv, rest } = require('./lib/supabase-rest');

loadEnv();

async function main() {
  const historyDays = Number(process.env.PRUNE_HISTORY_DAYS || 90);
  const runDays = Number(process.env.PRUNE_RUN_DAYS || 14);
  const eventDays = Number(process.env.PRUNE_EVENT_DAYS || 30);

  const result = await rest('rpc/prune_catalog_operational_data', {
    method: 'POST',
    body: { p_history_days: historyDays, p_run_days: runDays, p_event_days: eventDays },
  });

  console.log('Poda de datos operativos completada:', result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
