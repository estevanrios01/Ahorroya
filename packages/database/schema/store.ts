import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    numeric,
    jsonb
} from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 200 }).notNull().unique(),
    nit: varchar({ length: 50 }),
    legalName: varchar({ length: 300 }),
    logo: varchar({ length: 500 }),
    brand: varchar({ length: 150 }),
    chain: varchar({ length: 150 }),
    category: varchar({ length: 100 }),
    subcategory: varchar({ length: 100 }),
    website: varchar({ length: 500 }),
    phone: varchar({ length: 50 }),
    email: varchar({ length: 255 }),
    social: jsonb(),
    rating: numeric({ precision: 3, scale: 2 }),
    status: varchar({ length: 20 }).default("active").notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
