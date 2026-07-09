import {
    ingest
} from "@ahorroya/ingestion";

export async function ingestProducts() {
    const raw = [];
    await ingest(raw);
}
