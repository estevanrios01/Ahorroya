import {
    pgTable,
    uuid,
    timestamp,
    numeric,
    boolean
} from "drizzle-orm/pg-core";

import { storeProducts } from "./store-product";

export const storeProductHistory = pgTable(
    "store_product_history",
    {
        id: uuid().defaultRandom().primaryKey(),
        storeProductId: uuid()
            .references(() => storeProducts.id)
            .notNull(),
        price: numeric({
            precision: 12,
            scale: 2
        }).notNull(),
        available: boolean().default(true),
        capturedAt: timestamp().defaultNow()
    }
);
