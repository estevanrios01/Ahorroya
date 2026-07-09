import {
    pgTable,
    uuid,
    integer,
    uniqueIndex
} from "drizzle-orm/pg-core";

import { baskets } from "./basket";
import { masterProducts } from "./master-product";

export const basketItems = pgTable(
    "basket_items",
    {
        id: uuid().defaultRandom().primaryKey(),
        basketId: uuid()
            .references(() => baskets.id, {
                onDelete: "cascade"
            })
            .notNull(),
        masterProductId: uuid()
            .references(() => masterProducts.id)
            .notNull(),
        quantity: integer()
            .default(1)
            .notNull()
    },
    table => ({
        uniqueItem: uniqueIndex(
            "basket_unique_item"
        ).on(
            table.basketId,
            table.masterProductId
        )
    })
);
