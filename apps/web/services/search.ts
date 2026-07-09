import { db } from "@ahorroya/database";
import { sql } from "drizzle-orm";

export async function searchProducts(search: string) {
    const result = await db.execute(sql`
        SELECT
            p.id,
            p.name,
            p.slug,
            p.image,
            b.name AS brand
        FROM products p
        INNER JOIN brands b
            ON b.id = p.brand_id
        WHERE
            similarity(
                unaccent(lower(p.name)),
                unaccent(lower(${search}))
            ) > 0.20
        ORDER BY
            similarity(
                unaccent(lower(p.name)),
                unaccent(lower(${search}))
            ) DESC
        LIMIT 20
    `);

    return result;
}
