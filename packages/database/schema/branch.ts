import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    numeric,
    jsonb,
    time
} from "drizzle-orm/pg-core";
import { stores } from "./store";

export const branches = pgTable("branches", {
    id: uuid().defaultRandom().primaryKey(),
    storeId: uuid()
        .references(() => stores.id)
        .notNull(),
    name: varchar({ length: 200 }).notNull(),
    code: varchar({ length: 50 }),
    address: varchar({ length: 300 }),
    city: varchar({ length: 100 }),
    department: varchar({ length: 100 }),
    country: varchar({ length: 100 }).default("Colombia"),
    latitude: numeric({ precision: 10, scale: 7 }),
    longitude: numeric({ precision: 10, scale: 7 }),
    phone: varchar({ length: 50 }),
    schedule: jsonb(),
    services: jsonb(),
    hasParking: boolean().default(false),
    hasAccessibility: boolean().default(false),
    status: varchar({ length: 20 }).default("active").notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
