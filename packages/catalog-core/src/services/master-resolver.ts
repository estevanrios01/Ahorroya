import { MasterProduct } from "../domain/entities/master-product";
import { ProductName } from "../domain/value-objects/product-name";
import { BarcodeValue } from "../domain/value-objects/barcode-value";
import { Slug } from "../domain/value-objects/slug";

export interface ResolverResult {
    action: "create" | "link" | "merge" | "review";
    existingProduct?: MasterProduct;
    confidence: number;
    reason: string;
}

export class MasterResolver {
    resolve(
        name: string,
        barcode?: string,
        brandId?: string,
        existingProducts: MasterProduct[] = []
    ): ResolverResult {
        const productName = ProductName.create(name);

        // Exact match by barcode
        if (barcode) {
            const byBarcode = existingProducts.find((p) =>
                p.toJSON().barcodePrimary?.getValue() === barcode
            );
            if (byBarcode) {
                return {
                    action: "link",
                    existingProduct: byBarcode,
                    confidence: 100,
                    reason: `Código de barras coincide exactamente con ${byBarcode.getName().getValue()}`
                };
            }
        }

        // Name similarity match
        const scored = existingProducts.map((p) => ({
            product: p,
            similarity: productName.similarity(p.getName())
        })).sort((a, b) => b.similarity - a.similarity);

        if (scored.length > 0 && scored[0].similarity >= 0.85) {
            return {
                action: "link",
                existingProduct: scored[0].product,
                confidence: Math.round(scored[0].similarity * 100),
                reason: `Alta similitud de nombre con ${scored[0].product.getName().getValue()}`
            };
        }

        if (scored.length > 0 && scored[0].similarity >= 0.6) {
            return {
                action: "merge",
                existingProduct: scored[0].product,
                confidence: Math.round(scored[0].similarity * 100),
                reason: `Posible duplicado con ${scored[0].product.getName().getValue()}`
            };
        }

        if (scored.length > 0 && scored[0].similarity >= 0.4) {
            return {
                action: "review",
                confidence: Math.round(scored[0].similarity * 100),
                reason: `Revisión manual recomendada`
            };
        }

        return {
            action: "create",
            confidence: 100,
            reason: "Producto nuevo no encontrado en el catálogo"
        };
    }
}
