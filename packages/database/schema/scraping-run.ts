import {
    pgTable,
    uuid,
    timestamp,
    integer
} from "drizzle-orm/pg-core";

export const scrapingRuns = pgTable("scraping_runs", {
    id: uuid().defaultRandom().primaryKey(),
    productsFound: integer().default(0).notNull(),
    productsUpdated: integer().default(0).notNull(),
    productsInserted: integer().default(0).notNull(),
    durationSeconds: integer().default(0).notNull(),
    startedAt: timestamp().notNull(),
    finishedAt: timestamp()
});
