import {
    RawProduct,
    NormalizedProduct
} from "./types";

export function normalizeProduct(
    product: RawProduct
): NormalizedProduct {
    return {
        externalId:
            product.externalId,
        normalizedName:
            product.name,
        brand:
            undefined,
        ean:
            product.ean
    };
}
