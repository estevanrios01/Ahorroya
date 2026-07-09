import { db } from "@ahorroya/database";
import { sql } from "drizzle-orm";

export async function getProduct(slug: string) {
    const result = await db.execute(sql`
        SELECT *
        FROM products
        WHERE slug=${slug}
        LIMIT 1
    `);

    return result[0];
}
