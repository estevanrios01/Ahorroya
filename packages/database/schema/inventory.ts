import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    integer,
    numeric,
    boolean
} from "drizzle-orm/pg-core";
import { storeProducts } from "./store-product";

export const inventory = pgTable("inventory", {
    id: uuid().defaultRandom().primaryKey(),
    storeProductId: uuid()
        .references(() => storeProducts.id)
        .notNull(),
    quantity: integer().default(0).notNull(),
    available: integer().default(0).notNull(),
    reserved: integer().default(0).notNull(),
    minStock: integer().default(0),
    maxStock: integer().default(0),
    unit: varchar({ length: 20 }).default("unidad"),
    lastEntryAt: timestamp(),
    lastExitAt: timestamp(),
    rotation: numeric({ precision: 5, scale: 2 }),
    status: varchar({ length: 20 }).default("active").notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
