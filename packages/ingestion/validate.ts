import { RawProduct } from "./types";

export function validateProduct(
    product: RawProduct
): boolean {
    return (
        product.name.trim().length > 2 &&
        product.price > 0n &&
        product.available
    );
}
