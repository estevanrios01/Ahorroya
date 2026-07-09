import { RawProduct } from "./types";
import { validateProduct } from "./validate";
import { normalizeProduct } from "./normalize";

export async function ingest(
    products: RawProduct[]
) {
    const output = [];

    for (
        const product
        of products
    ) {
        if (
            !validateProduct(product)
        ) {
            continue;
        }

        output.push(
            normalizeProduct(
                product
            )
        );
    }

    return output;
}
