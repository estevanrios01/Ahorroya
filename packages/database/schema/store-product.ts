import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    numeric,
    boolean,
    integer
} from "drizzle-orm/pg-core";
import { masterProducts } from "./master-product";
import { stores } from "./store";

export const storeProducts = pgTable("store_products", {
    id: uuid().defaultRandom().primaryKey(),
    masterProductId: uuid()
        .references(() => masterProducts.id)
        .notNull(),
    storeId: uuid()
        .references(() => stores.id)
        .notNull(),
    branchId: uuid(),
    sku: varchar({ length: 100 }),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    originalPrice: numeric({ precision: 12, scale: 2 }),
    available: boolean().default(true).notNull(),
    stock: integer().default(0),
    url: varchar({ length: 500 }),
    capturedAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
