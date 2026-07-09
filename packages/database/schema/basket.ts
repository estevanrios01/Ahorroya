import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean
} from "drizzle-orm/pg-core";

import { users } from "./user";

export const baskets = pgTable("baskets", {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid()
        .references(() => users.id, {
            onDelete: "cascade"
        })
        .notNull(),
    name: varchar({ length: 150 }).notNull(),
    favorite: boolean()
        .default(false)
        .notNull(),
    createdAt: timestamp()
        .defaultNow()
        .notNull()
});
