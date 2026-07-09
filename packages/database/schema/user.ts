import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    jsonb
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey(),
    email: varchar({ length: 255 }).notNull().unique(),
    name: varchar({ length: 150 }),
    avatar: varchar({ length: 500 }),
    role: varchar({ length: 20 }).default("user").notNull(),
    phone: varchar({ length: 20 }),
    emailVerified: boolean().default(false).notNull(),
    preferences: jsonb(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
});
