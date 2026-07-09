import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    numeric,
    jsonb
} from "drizzle-orm/pg-core";

export const masterProducts = pgTable("master_products", {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 300 }).notNull(),
    slug: varchar({ length: 300 }).notNull().unique(),
    shortName: varchar({ length: 150 }),
    commercialName: varchar({ length: 300 }),
    brand: varchar({ length: 150 }),
    manufacturer: varchar({ length: 150 }),
    supplier: varchar({ length: 150 }),
    importer: varchar({ length: 150 }),
    country: varchar({ length: 100 }),
    category: varchar({ length: 100 }),
    subcategory: varchar({ length: 100 }),
    barcode: varchar({ length: 50 }),
    ean: varchar({ length: 50 }),
    upc: varchar({ length: 50 }),
    weight: numeric({ precision: 10, scale: 2 }),
    volume: numeric({ precision: 10, scale: 2 }),
    unit: varchar({ length: 20 }),
    description: text(),
    ingredients: text(),
    nutritionalInfo: jsonb(),
    healthRegister: varchar({ length: 100 }),
    image: varchar({ length: 500 }),
    status: varchar({ length: 20 }).default("active").notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
