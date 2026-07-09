import { MasterProduct } from "../domain/entities/master-product";

export interface DuplicateCandidate {
    product: MasterProduct;
    similarTo: MasterProduct;
    similarityScore: number;
    field: string;
}

export class DuplicateDetector {
    detect(products: MasterProduct[]): DuplicateCandidate[] {
        const candidates: DuplicateCandidate[] = [];

        for (let i = 0; i < products.length; i++) {
            for (let j = i + 1; j < products.length; j++) {
                const a = products[i];
                const b = products[j];

                const nameSimilarity = a.getName().similarity(b.getName());

                if (nameSimilarity >= 0.85) {
                    candidates.push({
                        product: a,
                        similarTo: b,
                        similarityScore: nameSimilarity,
                        field: "name"
                    });
                }

                const aBarcode = a.toJSON().barcodePrimary;
                const bBarcode = b.toJSON().barcodePrimary;

                if (aBarcode && bBarcode && aBarcode.equals(bBarcode)) {
                    candidates.push({
                        product: a,
                        similarTo: b,
                        similarityScore: 1,
                        field: "barcode"
                    });
                }
            }
        }

        return candidates;
    }
}
