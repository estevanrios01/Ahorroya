import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    integer,
    boolean
} from "drizzle-orm/pg-core";
import { masterProducts } from "./master-product";

export const productImages = pgTable("product_images", {
    id: uuid().defaultRandom().primaryKey(),
    masterProductId: uuid()
        .references(() => masterProducts.id)
        .notNull(),
    url: varchar({ length: 500 }).notNull(),
    thumbnailUrl: varchar({ length: 500 }),
    webpUrl: varchar({ length: 500 }),
    avifUrl: varchar({ length: 500 }),
    alt: varchar({ length: 200 }),
    width: integer(),
    height: integer(),
    sizeBytes: integer(),
    isPrimary: boolean().default(false).notNull(),
    hash: varchar({ length: 64 }),
    createdAt: timestamp().defaultNow().notNull()
});
