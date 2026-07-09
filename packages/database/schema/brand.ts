import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    text
} from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 150 }).notNull().unique(),
    slug: varchar({ length: 150 }).notNull().unique(),
    description: text(),
    logo: varchar({ length: 500 }),
    website: varchar({ length: 500 }),
    country: varchar({ length: 100 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
