import { buildSearchIndex } from "./jobs/build-search-index";
import { ingestProducts } from "./jobs/ingest-products";

async function main() {
    const task = process.argv[2];

    switch (task) {
        case "build-index":
            await buildSearchIndex();
            break;
        case "ingest":
            await ingestProducts();
            break;
        default:
            console.log(`
AhorroYa Worker v0.1.0

Uso:
  node apps/worker/src/index.js build-index   Construir índice de búsqueda
  node apps/worker/src/index.js ingest         Ingestar productos de scrapers
            `);
    }
}

main().catch(console.error);
