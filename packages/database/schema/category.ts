import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    integer
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 100 }).notNull().unique(),
    parentId: uuid(),
    level: integer().default(0).notNull(),
    icon: varchar({ length: 100 }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
