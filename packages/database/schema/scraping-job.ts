import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    integer,
    jsonb
} from "drizzle-orm/pg-core";

export const scrapingJobs = pgTable("scraping_jobs", {
    id: uuid().defaultRandom().primaryKey(),
    store: varchar({ length: 60 }).notNull(),
    status: varchar({ length: 20 }).default("pending").notNull(),
    priority: integer().default(100).notNull(),
    payload: jsonb().notNull(),
    startedAt: timestamp(),
    finishedAt: timestamp(),
    createdAt: timestamp().defaultNow().notNull()
});
